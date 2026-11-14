
create extension if not exists pgcrypto;


create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (length(trim(nome)) >= 2),
  papel text not null default 'recepcao'
    check (papel in ('recepcao', 'profissional', 'admin')),
  criado_em timestamptz not null default now()
);

comment on table public.perfis is
  'Perfil de acesso vinculado ao usuário do Supabase Auth (recepcao, profissional ou admin).';

create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) >= 2),
  cpf_ou_cartao_sus text not null unique
    check (length(trim(cpf_ou_cartao_sus)) between 3 and 32),
  telefone text not null check (length(trim(telefone)) >= 8),
  email text,
  canal_preferido text not null default 'email'
    check (canal_preferido in ('email', 'whatsapp', 'sms')),
  criado_em timestamptz not null default now()
);

comment on table public.pacientes is
  'Cadastro mínimo do paciente. Sem dados clínicos.';

create table if not exists public.profissionais (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) >= 2),
  especialidade text not null check (length(trim(especialidade)) >= 2),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.horarios (
  id uuid primary key default gen_random_uuid(),
  profissional_id uuid not null
    references public.profissionais (id) on delete restrict,
  inicio timestamptz not null,
  fim timestamptz not null,
  status text not null default 'livre'
    check (status in ('livre', 'ocupado')),
  removido_em timestamptz,
  criado_em timestamptz not null default now(),
  constraint horario_fim_apos_inicio check (fim > inicio),
  constraint horario_unico_por_profissional unique (profissional_id, inicio)
);

comment on table public.horarios is
  'Horários liberados pela equipe. inicio/fim em timestamptz; a interface exibe em America/Sao_Paulo.';

comment on column public.horarios.removido_em is
  'Quando preenchido, o horário foi removido pela equipe e não aparece mais para novas consultas.';

create table if not exists public.consultas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null
    references public.pacientes (id) on delete restrict,
  horario_id uuid not null
    references public.horarios (id) on delete restrict,
  status text not null default 'agendada'
    check (status in ('agendada', 'confirmada', 'cancelada', 'faltou', 'realizada')),
  token_confirmacao uuid not null default gen_random_uuid() unique,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on column public.consultas.token_confirmacao is
  'Token aleatório usado no link público de confirmar/cancelar (sem login).';

create unique index if not exists consultas_horario_ativo_unico
  on public.consultas (horario_id)
  where status <> 'cancelada';

create index if not exists consultas_paciente_idx
  on public.consultas (paciente_id);

create index if not exists consultas_status_idx
  on public.consultas (status);


create or replace function public.papel_atual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select papel from public.perfis where id = auth.uid();
$$;

revoke all on function public.papel_atual() from public;
grant execute on function public.papel_atual() to authenticated;

create or replace function public.atualizar_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists consultas_atualiza_timestamp on public.consultas;
create trigger consultas_atualiza_timestamp
  before update on public.consultas
  for each row execute function public.atualizar_timestamp();

create or replace function public.sincronizar_status_horario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    update public.horarios h
       set status = case
         when exists (
           select 1
           from public.consultas c
           where c.horario_id = h.id
             and c.status <> 'cancelada'
         ) then 'ocupado'
         else 'livre'
       end
     where h.id = old.horario_id;
  end if;

  if tg_op = 'INSERT' then
    update public.horarios h
       set status = case
         when exists (
           select 1
           from public.consultas c
           where c.horario_id = h.id
             and c.status <> 'cancelada'
         ) then 'ocupado'
         else 'livre'
       end
     where h.id = new.horario_id;
  elsif tg_op = 'UPDATE' then
    if new.horario_id is distinct from old.horario_id then
      update public.horarios h
         set status = case
           when exists (
             select 1
             from public.consultas c
             where c.horario_id = h.id
               and c.status <> 'cancelada'
           ) then 'ocupado'
           else 'livre'
         end
       where h.id = new.horario_id;
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists consultas_sincroniza_horario on public.consultas;
create trigger consultas_sincroniza_horario
  after insert or update or delete on public.consultas
  for each row execute function public.sincronizar_status_horario();

create or replace function public.validar_agendamento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inicio timestamptz;
  v_removido_em timestamptz;
begin
  if tg_op = 'UPDATE'
     and new.horario_id is not distinct from old.horario_id
     and not (old.status = 'cancelada' and new.status <> 'cancelada') then
    return new;
  end if;

  select inicio, removido_em into v_inicio, v_removido_em
  from public.horarios
  where id = new.horario_id;

  if v_inicio is null then
    raise exception 'Horário inexistente.';
  end if;

  if v_removido_em is not null then
    raise exception 'Este horário não existe mais.';
  end if;

  if new.status <> 'cancelada' then
    if v_inicio <= now() then
      raise exception 'Não é possível agendar em um horário que já passou.';
    end if;

    if v_inicio > now() + interval '30 days' then
      raise exception 'O agendamento é limitado a 30 dias de antecedência.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists consultas_valida_agendamento on public.consultas;
create trigger consultas_valida_agendamento
  before insert or update on public.consultas
  for each row execute function public.validar_agendamento();


alter table public.perfis enable row level security;
alter table public.pacientes enable row level security;
alter table public.profissionais enable row level security;
alter table public.horarios enable row level security;
alter table public.consultas enable row level security;

drop policy if exists perfis_select on public.perfis;
create policy perfis_select on public.perfis
  for select to authenticated
  using (id = auth.uid() or public.papel_atual() = 'admin');

drop policy if exists perfis_insert on public.perfis;
create policy perfis_insert on public.perfis
  for insert to authenticated
  with check (public.papel_atual() = 'admin');

drop policy if exists perfis_update on public.perfis;
create policy perfis_update on public.perfis
  for update to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');

drop policy if exists perfis_delete on public.perfis;
create policy perfis_delete on public.perfis
  for delete to authenticated
  using (public.papel_atual() = 'admin');

drop policy if exists pacientes_select on public.pacientes;
create policy pacientes_select on public.pacientes
  for select to authenticated
  using (public.papel_atual() is not null);

drop policy if exists pacientes_insert on public.pacientes;
create policy pacientes_insert on public.pacientes
  for insert to authenticated
  with check (public.papel_atual() in ('recepcao', 'admin'));

drop policy if exists pacientes_update on public.pacientes;
create policy pacientes_update on public.pacientes
  for update to authenticated
  using (public.papel_atual() in ('recepcao', 'admin'))
  with check (public.papel_atual() in ('recepcao', 'admin'));

drop policy if exists pacientes_delete on public.pacientes;
create policy pacientes_delete on public.pacientes
  for delete to authenticated
  using (public.papel_atual() = 'admin');

drop policy if exists profissionais_select on public.profissionais;
create policy profissionais_select on public.profissionais
  for select to authenticated
  using (public.papel_atual() is not null);

drop policy if exists profissionais_insert on public.profissionais;
create policy profissionais_insert on public.profissionais
  for insert to authenticated
  with check (public.papel_atual() = 'admin');

drop policy if exists profissionais_update on public.profissionais;
create policy profissionais_update on public.profissionais
  for update to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');

drop policy if exists profissionais_delete on public.profissionais;
create policy profissionais_delete on public.profissionais
  for delete to authenticated
  using (public.papel_atual() = 'admin');

drop policy if exists horarios_select on public.horarios;
create policy horarios_select on public.horarios
  for select to authenticated
  using (public.papel_atual() is not null);

drop policy if exists horarios_insert on public.horarios;
create policy horarios_insert on public.horarios
  for insert to authenticated
  with check (public.papel_atual() in ('recepcao', 'admin'));

drop policy if exists horarios_update on public.horarios;
create policy horarios_update on public.horarios
  for update to authenticated
  using (public.papel_atual() in ('recepcao', 'admin'))
  with check (public.papel_atual() in ('recepcao', 'admin'));

drop policy if exists horarios_delete on public.horarios;
create policy horarios_delete on public.horarios
  for delete to authenticated
  using (public.papel_atual() in ('recepcao', 'admin'));

drop policy if exists consultas_select on public.consultas;
create policy consultas_select on public.consultas
  for select to authenticated
  using (public.papel_atual() is not null);

drop policy if exists consultas_insert on public.consultas;
create policy consultas_insert on public.consultas
  for insert to authenticated
  with check (public.papel_atual() in ('recepcao', 'admin'));

drop policy if exists consultas_update on public.consultas;
create policy consultas_update on public.consultas
  for update to authenticated
  using (public.papel_atual() in ('recepcao', 'admin'))
  with check (public.papel_atual() in ('recepcao', 'admin'));

drop policy if exists consultas_delete on public.consultas;
create policy consultas_delete on public.consultas
  for delete to authenticated
  using (public.papel_atual() = 'admin');

revoke all on table public.perfis from anon;
revoke all on table public.pacientes from anon;
revoke all on table public.profissionais from anon;
revoke all on table public.horarios from anon;
revoke all on table public.consultas from anon;

grant select, insert, update, delete on table public.perfis to authenticated;
grant select, insert, update, delete on table public.pacientes to authenticated;
grant select, insert, update, delete on table public.profissionais to authenticated;
grant select, insert, update, delete on table public.horarios to authenticated;
grant select, insert, update, delete on table public.consultas to authenticated;


create or replace function public.cancelar_consulta(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_inicio timestamptz;
begin
  if coalesce(public.papel_atual(), '') not in ('recepcao', 'profissional', 'admin') then
    raise exception 'Seu perfil não tem acesso a essa ação.'
      using errcode = 'P0001';
  end if;

  select c.status, h.inicio
    into v_status, v_inicio
  from public.consultas c
  join public.horarios h on h.id = c.horario_id
  where c.id = p_id
  for update of c;

  if not found then
    raise exception 'Consulta não encontrada.'
      using errcode = 'P0001';
  end if;

  if v_status not in ('agendada', 'confirmada') then
    raise exception 'Esta consulta não pode mais ser cancelada.'
      using errcode = 'P0001';
  end if;

  if v_inicio <= now() then
    raise exception 'Só é possível cancelar consultas que ainda não aconteceram.'
      using errcode = 'P0001';
  end if;

  update public.consultas
     set status = 'cancelada'
   where id = p_id;
end;
$$;

revoke all on function public.cancelar_consulta(uuid) from public, anon;
grant execute on function public.cancelar_consulta(uuid) to authenticated;


create or replace function public.consulta_por_token(p_token uuid)
returns table (
  paciente_nome text,
  profissional_nome text,
  especialidade text,
  horario_inicio timestamptz,
  consulta_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.nome,
    pr.nome,
    pr.especialidade,
    h.inicio,
    c.status
  from public.consultas c
  join public.pacientes p on p.id = c.paciente_id
  join public.horarios h on h.id = c.horario_id
  join public.profissionais pr on pr.id = h.profissional_id
  where c.token_confirmacao = p_token
    and c.status in ('agendada', 'confirmada');
$$;

create or replace function public.responder_consulta(p_token uuid, p_acao text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consulta public.consultas%rowtype;
  v_inicio timestamptz;
  v_novo_status text;
begin
  if p_acao not in ('confirmar', 'cancelar') then
    raise exception 'Ação inválida.';
  end if;

  select * into v_consulta
  from public.consultas
  where token_confirmacao = p_token
  for update;

  if not found then
    raise exception 'Link inválido.';
  end if;

  if v_consulta.status not in ('agendada', 'confirmada') then
    raise exception 'Esta consulta não pode mais ser alterada.';
  end if;

  select inicio into v_inicio
  from public.horarios
  where id = v_consulta.horario_id;

  if v_inicio <= now() then
    raise exception 'Esta consulta já aconteceu.';
  end if;

  v_novo_status := case p_acao
    when 'confirmar' then 'confirmada'
    else 'cancelada'
  end;

  update public.consultas
  set status = v_novo_status
  where id = v_consulta.id;

  return v_novo_status;
end;
$$;

revoke all on function public.consulta_por_token(uuid) from public;
revoke all on function public.responder_consulta(uuid, text) from public;
grant execute on function public.consulta_por_token(uuid) to anon, authenticated;
grant execute on function public.responder_consulta(uuid, text) to anon, authenticated;

