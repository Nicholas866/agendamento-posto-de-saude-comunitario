export type CanalPreferido = "email" | "whatsapp" | "sms";

export type Paciente = {
  id: string;
  nome: string;
  cpf_ou_cartao_sus: string;
  telefone: string;
  email: string | null;
  canal_preferido: CanalPreferido;
  criado_em: string;
};

export type Profissional = {
  id: string;
  nome: string;
  especialidade: string;
  ativo: boolean;
  criado_em: string;
};

export type StatusHorario = "livre" | "ocupado";

export type StatusConsulta =
  | "agendada"
  | "confirmada"
  | "cancelada"
  | "faltou"
  | "realizada";

export type Horario = {
  id: string;
  profissional_id: string;
  inicio: string;
  fim: string;
  status: StatusHorario;
  removido_em: string | null;
  criado_em: string;
};

export type HorarioComProfissional = Horario & {
  profissionais: {
    id: string;
    nome: string;
    especialidade: string;
    ativo: boolean;
  } | null;
};

export type Consulta = {
  id: string;
  paciente_id: string;
  horario_id: string;
  status: StatusConsulta;
  token_confirmacao: string;
  criado_em: string;
  atualizado_em: string;
};

export type ConsultaAgenda = {
  id: string;
  status: StatusConsulta;
  paciente_nome: string;
  profissional_id: string;
  profissional_nome: string;
  especialidade: string;
  inicio: string;
  fim: string;
};

export type ConsultaDetalhe = {
  id: string;
  status: StatusConsulta;
  criado_em: string;
  atualizado_em: string;
  paciente: {
    id: string;
    nome: string;
    cpf_ou_cartao_sus: string;
    telefone: string;
    email: string | null;
  };
  horario: {
    id: string;
    inicio: string;
    fim: string;
    profissional_id: string;
    profissional_nome: string;
    especialidade: string;
  };
};

export type EstadoFormulario = {
  ok: boolean;
  erros: Record<string, string>;
  valores: Record<string, string>;
};

export type AcaoFormulario = (
  estado: EstadoFormulario,
  formData: FormData,
) => Promise<EstadoFormulario>;

export const ESTADO_INICIAL: EstadoFormulario = {
  ok: false,
  erros: {},
  valores: {},
};

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
