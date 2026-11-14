"use server";

import { redirect } from "next/navigation";

import { exigirPapel } from "@/lib/auth";
import { criarUsuarioNoSistema } from "@/lib/dados/usuarios";
import type { AcaoFormulario } from "@/lib/tipos";
import { validarNovoUsuario } from "@/lib/validacao-usuario";

export const criarUsuario: AcaoFormulario = async (_estado, formData) => {
  await exigirPapel("admin");

  const valores = Object.fromEntries(formData) as Record<string, string>;
  const valoresSemSenha = { ...valores };
  delete valoresSemSenha.senha;

  const { erros, dados } = validarNovoUsuario(valores);

  if (Object.keys(erros).length > 0) {
    return { ok: false, erros, valores: valoresSemSenha };
  }

  try {
    const resultado = await criarUsuarioNoSistema(dados);

    if (!resultado.ok) {
      return {
        ok: false,
        erros: { geral: resultado.mensagem },
        valores: valoresSemSenha,
      };
    }
  } catch {
    return {
      ok: false,
      erros: {
        geral:
          "Não foi possível criar o usuário. Confira a configuração do servidor e tente novamente.",
      },
      valores: valoresSemSenha,
    };
  }

  redirect("/usuarios?sucesso=criado");
};
