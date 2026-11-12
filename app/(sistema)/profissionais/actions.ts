"use server";

import { redirect } from "next/navigation";

import { exigirPapel } from "@/lib/auth";
import { mensagemDeErroBanco } from "@/lib/erros";
import { createClient } from "@/lib/supabase/server";
import type { AcaoFormulario } from "@/lib/tipos";
import { UUID_REGEX } from "@/lib/tipos";
import { validarProfissional } from "@/lib/validacao";

export const criarProfissional: AcaoFormulario = async (_estado, formData) => {
  await exigirPapel("admin");

  const valores = Object.fromEntries(formData) as Record<string, string>;
  const { erros, dados } = validarProfissional(valores);

  if (Object.keys(erros).length > 0) {
    return { ok: false, erros, valores };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profissionais").insert(dados);

  if (error) {
    return {
      ok: false,
      erros: { geral: mensagemDeErroBanco(error) },
      valores,
    };
  }

  redirect("/profissionais?sucesso=criado");
};

export const editarProfissional: AcaoFormulario = async (_estado, formData) => {
  await exigirPapel("admin");

  const valores = Object.fromEntries(formData) as Record<string, string>;
  const id = valores.id ?? "";

  if (!UUID_REGEX.test(id)) {
    return {
      ok: false,
      erros: { geral: "Profissional inválido." },
      valores,
    };
  }

  const { erros, dados } = validarProfissional(valores);

  if (Object.keys(erros).length > 0) {
    return { ok: false, erros, valores };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profissionais")
    .update(dados)
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      erros: { geral: mensagemDeErroBanco(error) },
      valores,
    };
  }

  redirect("/profissionais?sucesso=editado");
};

/**
 * Ativa/desativa sem apagar: consultas antigas continuam ligadas ao
 * profissional. Na Fase 3, apenas profissionais ativos aparecem para
 * novos horários.
 */
export async function alternarAtivo(formData: FormData) {
  await exigirPapel("admin");

  const id = String(formData.get("id") ?? "");
  const ativo = String(formData.get("ativo") ?? "") === "true";

  if (!UUID_REGEX.test(id)) {
    redirect("/profissionais?erro=invalido");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profissionais")
    .update({ ativo })
    .eq("id", id);

  if (error) {
    redirect("/profissionais?erro=salvar");
  }

  redirect(`/profissionais?sucesso=${ativo ? "ativado" : "desativado"}`);
}
