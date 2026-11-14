import "server-only";

import type { Papel } from "@/lib/auth";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import type { DadosNovoUsuario } from "@/lib/validacao-usuario";

export type UsuarioSistema = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

export type ResultadoCriacaoUsuario =
  | { ok: true }
  | { ok: false; mensagem: string };

function mensagemErroAuth(codigo?: string, mensagem?: string): string {
  const texto = (mensagem ?? "").toLowerCase();

  if (
    codigo === "email_exists" ||
    texto.includes("already") ||
    texto.includes("registered")
  ) {
    return "Este e-mail já está cadastrado.";
  }

  if (codigo === "weak_password" || texto.includes("password")) {
    return "A senha não foi aceita. Use pelo menos 8 caracteres.";
  }

  if (codigo === "invalid_email" || texto.includes("email")) {
    return "Digite um e-mail válido.";
  }

  return "Não foi possível criar a conta. Tente novamente em instantes.";
}

/** Lista os perfis e busca o e-mail correspondente no Auth. */
export async function listarUsuarios(): Promise<UsuarioSistema[]> {
  const admin = criarClienteAdmin();

  const { data: perfis, error } = await admin
    .from("perfis")
    .select("id, nome, papel");

  if (error) {
    throw new Error("Não foi possível carregar os usuários.");
  }

  const { data: contas, error: erroContas } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (erroContas) {
    throw new Error("Não foi possível carregar as contas de acesso.");
  }

  const emailPorId = new Map(
    contas.users.map((usuario) => [usuario.id, usuario.email ?? ""]),
  );

  return (perfis ?? [])
    .map((perfil) => ({
      id: perfil.id as string,
      nome: perfil.nome as string,
      email: emailPorId.get(perfil.id as string) ?? "",
      papel: perfil.papel as Papel,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/**
 * Cria a conta no Auth já confirmada e o perfil correspondente.
 * Se o perfil falhar, remove a conta recém-criada.
 */
export async function criarUsuarioNoSistema(
  dados: DadosNovoUsuario,
): Promise<ResultadoCriacaoUsuario> {
  const admin = criarClienteAdmin();

  const { data: criado, error } = await admin.auth.admin.createUser({
    email: dados.email,
    password: dados.senha,
    email_confirm: true,
  });

  if (error || !criado.user) {
    return {
      ok: false,
      mensagem: mensagemErroAuth(error?.code, error?.message),
    };
  }

  const { error: erroPerfil } = await admin.from("perfis").insert({
    id: criado.user.id,
    nome: dados.nome,
    papel: dados.papel,
  });

  if (erroPerfil) {
    await admin.auth.admin.deleteUser(criado.user.id);

    return {
      ok: false,
      mensagem:
        "A conta não pôde ser concluída porque o perfil falhou. Tente novamente.",
    };
  }

  return { ok: true };
}
