
begin;

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

commit;
