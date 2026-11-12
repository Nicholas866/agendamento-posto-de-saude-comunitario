"use server";

import { redirect } from "next/navigation";

import { exigirPapel } from "@/lib/auth";
import { mensagemDeErroBanco } from "@/lib/erros";
import { createClient } from "@/lib/supabase/server";
import type { AcaoFormulario } from "@/lib/tipos";
import { UUID_REGEX } from "@/lib/tipos";
import { validarPaciente } from "@/lib/validacao";

const MENSAGEM_DUPLICADO = "Este CPF/Cartão SUS já está cadastrado.";

export const criarPaciente: AcaoFormulario = async (_estado, formData) => {
  await exigirPapel("recepcao", "admin");

  const valores = Object.fromEntries(formData) as Record<string, string>;
  const { erros, dados } = validarPaciente(valores);

  if (Object.keys(erros).length > 0) {
    return { ok: false, erros, valores };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pacientes").insert(dados);

  if (error) {
    return {
      ok: false,
      erros: { geral: mensagemDeErroBanco(error, MENSAGEM_DUPLICADO) },
      valores,
    };
  }

  redirect("/pacientes?sucesso=criado");
};

export const editarPaciente: AcaoFormulario = async (_estado, formData) => {
  await exigirPapel("recepcao", "admin");

  const valores = Object.fromEntries(formData) as Record<string, string>;
  const id = valores.id ?? "";

  if (!UUID_REGEX.test(id)) {
    return {
      ok: false,
      erros: { geral: "Paciente inválido." },
      valores,
    };
  }

  const { erros, dados } = validarPaciente(valores);

  if (Object.keys(erros).length > 0) {
    return { ok: false, erros, valores };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pacientes")
    .update(dados)
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      erros: { geral: mensagemDeErroBanco(error, MENSAGEM_DUPLICADO) },
      valores,
    };
  }

  redirect("/pacientes?sucesso=editado");
};
