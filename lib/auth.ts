import { redirect } from "next/navigation";

import { createClient } from "./supabase/server";

export type Papel = "recepcao" | "profissional" | "admin";

export type Perfil = {
  id: string;
  nome: string;
  papel: Papel;
};

/**
 * Lê o usuário logado e o perfil correspondente na tabela `perfis`.
 * Retorna null quando não há sessão OU quando o usuário não tem perfil.
 */
export async function getPerfilAtual(): Promise<Perfil | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome, papel")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Perfil;
}

/**
 * Garante que existe sessão E perfil. Sem perfil, volta ao login com aviso.
 */
export async function exigirPerfil(): Promise<Perfil> {
  const perfil = await getPerfilAtual();

  if (!perfil) {
    redirect("/login?erro=sem-perfil");
  }

  return perfil;
}

/**
 * Garante que o perfil tem um dos papéis permitidos.
 */
export async function exigirPapel(...papeis: Papel[]): Promise<Perfil> {
  const perfil = await exigirPerfil();

  if (!papeis.includes(perfil.papel)) {
    redirect("/agenda?erro=sem-permissao");
  }

  return perfil;
}

export const NOME_DO_PAPEL: Record<Papel, string> = {
  recepcao: "Recepção",
  profissional: "Profissional de saúde",
  admin: "Administrador",
};

export function rotaInicial(papel: Papel): string {
  return papel === "admin" ? "/painel" : "/agenda";
}
