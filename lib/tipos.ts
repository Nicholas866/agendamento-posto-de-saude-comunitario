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
