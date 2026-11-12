-- =====================================================================
-- Agenda UBS — Fase 3: horários e agenda
--
-- Como aplicar: Supabase > SQL Editor > colar e executar DEPOIS do
-- schema.sql e do seed.sql. Pode rodar mais de uma vez.
--
-- O que este arquivo faz:
--   1. Adiciona horarios.removido_em (exclusão lógica de horários).
--   2. Atualiza validar_agendamento para recusar horário removido.
--
-- Por que exclusão lógica: consultas canceladas continuam apontando para
-- o horário (on delete restrict). Remover de verdade apagaria o histórico
-- da consulta. Com removido_em, o horário some das listas sem perder o
-- vínculo com consultas antigas.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Exclusão lógica de horários
-- ---------------------------------------------------------------------
alter table public.horarios
  add column if not exists removido_em timestamptz;

comment on column public.horarios.removido_em is
  'Quando preenchido, o horário foi removido pela equipe e não aparece mais para novas consultas.';

-- ---------------------------------------------------------------------
-- 2. Regra de agendamento
--
-- Mantém as regras da Fase 1 e passa a recusar horário removido. O
-- search_path continua fixo em public por segurança.
-- ---------------------------------------------------------------------
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
  -- Só pula a validação quando o horário não mudou e a consulta não está
  -- sendo reativada (cancelada -> agendada/confirmada).
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

commit;
