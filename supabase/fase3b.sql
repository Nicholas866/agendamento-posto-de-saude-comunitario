-- =====================================================================
-- Agenda UBS — Fase 3B: correção do status do horário ao cancelar
--
-- Como aplicar: Supabase > SQL Editor > colar e executar. Pode rodar
-- mais de uma vez.
--
-- O que este arquivo faz:
--   1. Recria a função que sincroniza horarios.status com as consultas.
--   2. Recria o gatilho consultas_sincroniza_horario.
--   3. Corrige horários que já ficaram com status inconsistente.
--
-- Diagnóstico opcional antes de rodar:
--   select tgname, tgenabled
--   from pg_trigger
--   where tgrelid = 'public.consultas'::regclass
--     and tgname = 'consultas_sincroniza_horario';
--
--   select proname, prosecdef
--   from pg_proc
--   where proname = 'sincronizar_status_horario';
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Função de sincronização
--
-- Recalcula o status do horário a partir das consultas ativas. Assim
-- funciona para criar, cancelar, remarcar, marcar presença/falta e
-- desfazer, sem depender de qual status antigo a consulta tinha.
-- ---------------------------------------------------------------------
create or replace function public.sincronizar_status_horario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Horário antigo: em UPDATE que trocou de horário e em DELETE.
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

  -- Horário novo: em INSERT e em UPDATE que trocou de horário.
  -- No UPDATE em que o horário não mudou, o bloco acima já resolveu.
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

-- ---------------------------------------------------------------------
-- 2. Gatilho
-- ---------------------------------------------------------------------
drop trigger if exists consultas_sincroniza_horario on public.consultas;

create trigger consultas_sincroniza_horario
  after insert or update or delete on public.consultas
  for each row execute function public.sincronizar_status_horario();

-- ---------------------------------------------------------------------
-- 3. Corrige horários já inconsistentes
--
-- Horário com consulta ativa fica "ocupado"; sem consulta ativa, "livre".
-- ---------------------------------------------------------------------
with esperado as (
  select
    h.id,
    case
      when exists (
        select 1
        from public.consultas c
        where c.horario_id = h.id
          and c.status <> 'cancelada'
      ) then 'ocupado'
      else 'livre'
    end as status
  from public.horarios h
)
update public.horarios h
   set status = e.status
  from esperado e
 where h.id = e.id
   and h.status is distinct from e.status;

commit;

-- Conferência depois de rodar:
--   select count(*) as horarios_inconsistentes
--   from public.horarios h
--   where h.status is distinct from (
--     case
--       when exists (
--         select 1
--         from public.consultas c
--         where c.horario_id = h.id
--           and c.status <> 'cancelada'
--       ) then 'ocupado'
--       else 'livre'
--     end
--   );
