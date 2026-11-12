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
-- passadas usadas nos testes (faltou/realizada e horários de hoje que
-- já passaram).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Pacientes (5)
-- ---------------------------------------------------------------------
insert into public.pacientes (id, nome, cpf_ou_cartao_sus, telefone, email, canal_preferido)
values
  ('00000000-0000-4000-8000-000000000101', 'Maria Aparecida Souza', '00000000001', '16900000001', 'paciente1@exemplo.com', 'email'),
  ('00000000-0000-4000-8000-000000000102', 'João Carlos Lima', '00000000002', '16900000002', 'paciente2@exemplo.com', 'whatsapp'),
  ('00000000-0000-4000-8000-000000000103', 'Ana Paula Ferreira', '00000000003', '16900000003', 'paciente3@exemplo.com', 'email'),
  ('00000000-0000-4000-8000-000000000104', 'José Roberto Alves', '00000000004', '16900000004', 'paciente4@exemplo.com', 'sms'),
  ('00000000-0000-4000-8000-000000000105', 'Francisca Gomes da Silva', '00000000005', '16900000005', 'paciente5@exemplo.com', 'email')
on conflict (id) do update set
  nome = excluded.nome,
  cpf_ou_cartao_sus = excluded.cpf_ou_cartao_sus,
  telefone = excluded.telefone,
  email = excluded.email,
  canal_preferido = excluded.canal_preferido;

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
--   * hoje: 2 já passaram (testar Faltou/Realizada)
--   * hoje: 2 futuros ocupados (testar Cancelar)
--   * hoje: 2 futuros livres (testar Nova consulta)
--   * amanhã/depois: 2 livres e 2 ocupados
--   * passado: 4 para o painel
-- Horários calculados no fuso de São Paulo.
--
-- Os horários de hoje são relativos à hora em que o script roda. Se você
-- rodar o seed perto da meia-noite, algum horário pode cair no dia
-- anterior ou seguinte.
-- ---------------------------------------------------------------------
insert into public.horarios (id, profissional_id, inicio, fim, status)
values
  -- Futuro livre (amanhã)
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 10 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 10 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),

  -- Futuro ocupado (depois de amanhã)
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 11 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 11 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),

  -- Hoje: futuros livres (ordem decrescente para o seed poder ser rodado
  -- de novo sem colidir com os horários antigos)
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000202',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '4 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '4 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000201',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '3 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '3 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),

  -- Hoje: futuros ocupados (testar Cancelar)
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000202',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '2 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '2 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000201',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '1 hour') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '1 hour 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),

  -- Hoje: já passaram (testar Faltou/Realizada)
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000202',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '1 hour') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000201',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '2 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '1 hour 30 minutes') at time zone 'America/Sao_Paulo',
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
on conflict (id) do update set
  profissional_id = excluded.profissional_id,
  inicio = excluded.inicio,
  fim = excluded.fim,
  status = excluded.status,
  removido_em = null;

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

  -- Hoje: futuros ocupados (testar Cancelar)
  ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000307', 'agendada',  '00000000-0000-4000-8000-000000000609'),
  ('00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000308', 'confirmada', '00000000-0000-4000-8000-000000000610'),

  -- Hoje: já passaram (testar Faltou/Realizada)
  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000305', 'agendada',  '00000000-0000-4000-8000-000000000607'),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000306', 'confirmada', '00000000-0000-4000-8000-000000000608'),

  -- Passado (painel de faltas)
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000401', 'faltou',    '00000000-0000-4000-8000-000000000603'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000402', 'faltou',    '00000000-0000-4000-8000-000000000604'),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000403', 'realizada', '00000000-0000-4000-8000-000000000605'),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000404', 'realizada', '00000000-0000-4000-8000-000000000606')
on conflict (id) do update set
  paciente_id = excluded.paciente_id,
  horario_id = excluded.horario_id,
  status = excluded.status;

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
--      '00000000-0000-4000-8000-000000000506',
--      '00000000-0000-4000-8000-000000000507',
--      '00000000-0000-4000-8000-000000000508',
--      '00000000-0000-4000-8000-000000000509',
--      '00000000-0000-4000-8000-000000000510'
--    );
--   delete from public.horarios
--    where id like '00000000-0000-4000-8000-0000000003%'
--       or id like '00000000-0000-4000-8000-0000000004%';
--   delete from public.pacientes
--    where id like '00000000-0000-4000-8000-0000000001%';
--   delete from public.profissionais
--    where id like '00000000-0000-4000-8000-0000000002%';
-- ---------------------------------------------------------------------
