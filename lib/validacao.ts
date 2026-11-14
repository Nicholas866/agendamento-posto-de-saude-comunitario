import { somenteDigitos } from "./formatacao";
import type { CanalPreferido } from "./tipos";

export type DadosPaciente = {
  nome: string;
  cpf_ou_cartao_sus: string;
  telefone: string;
  email: string | null;
  canal_preferido: CanalPreferido;
};

export type DadosProfissional = {
  nome: string;
  especialidade: string;
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CANAIS: CanalPreferido[] = ["email", "whatsapp", "sms"];

/**
 * Validação no servidor. CPF/Cartão SUS e telefone são normalizados para
 * dígitos antes de gravar, então "123.456.789-09" e "12345678909" são iguais.
 * Não valida dígito verificador: os dados de teste são fictícios.
 */
export function validarPaciente(valores: Record<string, string>): {
  erros: Record<string, string>;
  dados: DadosPaciente;
} {
  const erros: Record<string, string> = {};

  const nome = (valores.nome ?? "").trim();
  const cpf = somenteDigitos(valores.cpf_ou_cartao_sus ?? "");
  const telefone = somenteDigitos(valores.telefone ?? "");
  const email = (valores.email ?? "").trim();
  const canal = (valores.canal_preferido ?? "email").trim();

  if (nome.length < 2) {
    erros.nome = "Informe o nome completo (mínimo 2 letras).";
  } else if (nome.length > 120) {
    erros.nome = "O nome pode ter no máximo 120 caracteres.";
  }

  if (cpf.length !== 11 && cpf.length !== 15) {
    erros.cpf_ou_cartao_sus =
      "Digite um CPF (11 dígitos) ou Cartão SUS (15 dígitos).";
  }

  if (telefone.length !== 10 && telefone.length !== 11) {
    erros.telefone = "Digite um telefone com DDD (10 ou 11 dígitos).";
  }

  if (email && !EMAIL_REGEX.test(email)) {
    erros.email = "Digite um e-mail válido ou deixe em branco.";
  }

  if (!CANAIS.includes(canal as CanalPreferido)) {
    erros.canal_preferido = "Escolha um canal de aviso válido.";
  }

  return {
    erros,
    dados: {
      nome,
      cpf_ou_cartao_sus: cpf,
      telefone,
      email: email || null,
      canal_preferido: canal as CanalPreferido,
    },
  };
}

export function validarProfissional(valores: Record<string, string>): {
  erros: Record<string, string>;
  dados: DadosProfissional;
} {
  const erros: Record<string, string> = {};

  const nome = (valores.nome ?? "").trim();
  const especialidade = (valores.especialidade ?? "").trim();

  if (nome.length < 2) {
    erros.nome = "Informe o nome do profissional (mínimo 2 letras).";
  } else if (nome.length > 120) {
    erros.nome = "O nome pode ter no máximo 120 caracteres.";
  }

  if (especialidade.length < 2) {
    erros.especialidade = "Informe a especialidade (mínimo 2 letras).";
  } else if (especialidade.length > 80) {
    erros.especialidade = "A especialidade pode ter no máximo 80 caracteres.";
  }

  return { erros, dados: { nome, especialidade } };
}
