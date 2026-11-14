
begin;

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

insert into public.profissionais (id, nome, especialidade, ativo)
values
  ('00000000-0000-4000-8000-000000000201', 'Dra. Helena Martins', 'Clínica geral', true),
  ('00000000-0000-4000-8000-000000000202', 'Dr. Paulo Andrade', 'Enfermagem', true)
on conflict (id) do nothing;

insert into public.horarios (id, profissional_id, inicio, fim, status)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 10 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day 10 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),

  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000201',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 9 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 9 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000202',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 11 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '2 days 11 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),

  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000202',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '4 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '4 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000201',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '3 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '3 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'livre'),

  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000202',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '2 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '2 hours 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000201',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '1 hour') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') + interval '1 hour 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),

  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000202',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '1 hour') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000201',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '2 hours') at time zone 'America/Sao_Paulo',
    (date_trunc('hour', now() at time zone 'America/Sao_Paulo') - interval '1 hour 30 minutes') at time zone 'America/Sao_Paulo',
    'ocupado'),

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

alter table public.consultas disable trigger consultas_valida_agendamento;

insert into public.consultas (id, paciente_id, horario_id, status)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000303', 'agendada'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000304', 'confirmada'),

  ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000307', 'agendada'),
  ('00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000308', 'confirmada'),

  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000305', 'agendada'),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000306', 'confirmada'),

  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000401', 'faltou'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000402', 'faltou'),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000403', 'realizada'),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000404', 'realizada')
on conflict (id) do update set
  paciente_id = excluded.paciente_id,
  horario_id = excluded.horario_id,
  status = excluded.status;

alter table public.consultas enable trigger consultas_valida_agendamento;

commit;

