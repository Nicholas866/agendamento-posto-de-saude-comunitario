-- =====================================================================
-- Agenda UBS — dados FICTÍCIOS para desenvolvimento e testes
--
-- NÃO use dados reais. Todos os nomes, CPFs, telefones e e-mails abaixo
-- são inventados (LGPD).
--
-- Como aplicar: Supabase > SQL Editor > colar e executar DEPOIS do
-- schema.sql. Pode rodar mais de uma vez: os IDs são fixos.
--
-- Observação: o gatilho que valida a antecedência de 30 dias fica
-- desabilitado apenas durante este script, para permitir consultas
-- passadas (faltou/realizada) usadas no painel.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Pacientes (5)
-- ---------------------------------------------------------------------
insert into public.pacientes (id, nome, cpf_ou_cartao_sus, telefone, email, canal_preferido)
values
  ('00000000-0000-4000-8000-000000000101', 'Maria Aparecida Souza', '000.000.000-01', '(16) 90000-0001', 'paciente1@exemplo.com', 'email'),
  ('00000000-0000-4000-8000-000000000102', 'João Carlos Lima', '000.000.000-02', '(16) 90000-0002', 'paciente2@exemplo.com', 'whatsapp'),
  ('00000000-0000-4000-8000-000000000103', 'Ana Paula Ferreira', '000.000.000-03', '(16) 90000-0003', 'paciente3@exemplo.com', 'email'),
  ('00000000-0000-4000-8000-000000000104', 'José Roberto Alves', '000.000.000-04', '(16) 90000-0004', 'paciente4@exemplo.com', 'sms'),
  ('00000000-0000-4000-8000-000000000105', 'Francisca Gomes da Silva', '000.000.000-05', '(16) 90000-0005', 'paciente5@exemplo.com', 'email')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Profissionais (2)
-- ---------------------------------------------------------------------
insert into public.profissionais (id, nome, especialidade, ativo)
values
  ('00000000-0000-4000-8000-000000000201', 'Dra. Helena Martins', 'Clínica geral', true),
  ('00000000-0000-4000-8000-000000000202', 'Dr. Paulo Andrade', 'Enfermagem', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Horários
--   * 2 livres no futuro (para testar a marcação)
--   * 2 ocupados no futuro (agendada/confirmada)
--   * 4 no passado (para o painel de faltas)
-- Horários calculados no fuso de São Paulo.
-- ---------------------------------------------------------------------
insert into public.horarios (id, profissional_id, inicio, fim, status)
values
  -- Futuro livre
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 10 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 10 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),

  -- Futuro ocupado
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 11 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 11 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),

  -- Passado (painel)
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '7 days' + interval '9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '7 days' + interval '9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '8 days' + interval '10 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '8 days' + interval '10 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '14 days' + interval '9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '14 days' + interval '9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '15 days' + interval '11 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') - interval '15 days' + interval '11 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Consultas
-- ---------------------------------------------------------------------
-- Só para este bloco: permite inserir consultas no passado.
alter table public.consultas disable trigger consultas_valida_agendamento;

insert into public.consultas (id, paciente_id, horario_id, status, token_confirmacao)
values
  -- Futuro
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000303', 'agendada',  '00000000-0000-4000-8000-000000000601'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000304', 'confirmada', '00000000-0000-4000-8000-000000000602'),

  -- Passado (painel de faltas)
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000401', 'faltou',    '00000000-0000-4000-8000-000000000603'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000402', 'faltou',    '00000000-0000-4000-8000-000000000604'),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000403', 'realizada', '00000000-0000-4000-8000-000000000605'),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000404', 'realizada', '00000000-0000-4000-8000-000000000606')
on conflict (id) do nothing;

alter table public.consultas enable trigger consultas_valida_agendamento;

commit;

-- ---------------------------------------------------------------------
-- Para remover os dados fictícios (na ordem por causa das chaves):
--
--   delete from public.consultas
--    where id in (
--      '00000000-0000-4000-8000-000000000501',
--      '00000000-0000-4000-8000-000000000502',
--      '00000000-0000-4000-8000-000000000503',
--      '00000000-0000-4000-8000-000000000504',
--      '00000000-0000-4000-8000-000000000505',
--      '00000000-0000-4000-8000-000000000506'
--    );
--   delete from public.horarios
--    where id like '00000000-0000-4000-8000-0000000003%'
--       or id like '00000000-0000-4000-8000-0000000004%';
--   delete from public.pacientes
--    where id like '00000000-0000-4000-8000-0000000001%';
--   delete from public.profissionais
--    where id like '00000000-0000-4000-8000-0000000002%';
-- ---------------------------------------------------------------------
