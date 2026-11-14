import type { Papel } from "./auth";
import { EMAIL_REGEX } from "./validacao";

export const PAPEIS_USUARIO: Papel[] = ["recepcao", "profissional", "admin"];

export type DadosNovoUsuario = {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
};

export function validarNovoUsuario(valores: Record<string, string>): {
  erros: Record<string, string>;
  dados: DadosNovoUsuario;
} {
  const erros: Record<string, string> = {};

  const nome = (valores.nome ?? "").trim();
  const email = (valores.email ?? "").trim().toLowerCase();
  const senha = valores.senha ?? "";
  const papel = (valores.papel ?? "").trim();

  if (nome.length < 2) {
    erros.nome = "Informe o nome (mínimo 2 caracteres).";
  } else if (nome.length > 120) {
    erros.nome = "O nome pode ter no máximo 120 caracteres.";
  }

  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    erros.email = "Digite um e-mail válido.";
  }

  if (senha.length < 8) {
    erros.senha = "A senha precisa ter no mínimo 8 caracteres.";
  }

  if (!PAPEIS_USUARIO.includes(papel as Papel)) {
    erros.papel = "Escolha um papel válido.";
  }

  return {
    erros,
    dados: {
      nome,
      email,
      senha,
      papel: papel as Papel,
    },
  };
}
