
begin;

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

