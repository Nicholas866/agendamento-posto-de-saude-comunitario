"use server";

import { redirect } from "next/navigation";

import { dataDentroDoLimite, dataSP, hojeSP } from "@/lib/datahora";
import { buscarHorario } from "@/lib/dados/horarios";
import { buscarPaciente } from "@/lib/dados/pacientes";
import { exigirPapel } from "@/lib/auth";
import { mensagemDeErroBanco } from "@/lib/erros";
import { createClient } from "@/lib/supabase/server";
import type { AcaoFormulario } from "@/lib/tipos";
import { validarNovaConsulta } from "@/lib/validacao-agenda";

export const criarConsulta: AcaoFormulario = async (_estado, formData) => {
  await exigirPapel("recepcao", "admin");

  const valores = Object.fromEntries(formData) as Record<string, string>;
  const { erros, dados } = validarNovaConsulta(valores);

  if (Object.keys(erros).length > 0 || !dados) {
    return { ok: false, erros, valores };
  }

  const paciente = await buscarPaciente(dados.paciente_id);

  if (!paciente) {
    return {
      ok: false,
      erros: {
        paciente_id: "Paciente não encontrado. Atualize a página e tente novamente.",
      },
      valores,
    };
  }

  const horario = await buscarHorario(dados.horario_id);

  if (!horario || horario.removido_em) {
    return {
      ok: false,
      erros: {
        horario_id: "Este horário não existe mais. Atualize a página.",
      },
      valores,
    };
  }

  if (horario.profissionais && !horario.profissionais.ativo) {
    return {
      ok: false,
      erros: {
        horario_id:
          "Este profissional não está ativo. Escolha um horário de outro profissional.",
      },
      valores,
    };
  }

  if (horario.status !== "livre") {
    return {
      ok: false,
      erros: {
        horario_id: "Este horário já está ocupado. Escolha outro horário livre.",
      },
      valores,
    };
  }

  const inicio = new Date(horario.inicio).getTime();

  if (inicio <= Date.now()) {
    return {
      ok: false,
      erros: {
        horario_id: "Este horário já passou. Escolha um horário futuro.",
      },
      valores,
    };
  }

  const data = dataSP(horario.inicio);

  if (!dataDentroDoLimite(data) || data < hojeSP()) {
    return {
      ok: false,
      erros: {
        horario_id:
          "Só é possível agendar com até 30 dias de antecedência. Escolha outro horário.",
      },
      valores,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("consultas").insert({
    paciente_id: dados.paciente_id,
    horario_id: dados.horario_id,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        erros: {
          horario_id:
            "Este horário acabou de ser ocupado por outra pessoa. Escolha outro horário livre.",
        },
        valores,
      };
    }

    return {
      ok: false,
      erros: { geral: mensagemDeErroBanco(error) },
      valores,
    };
  }

  redirect(`/agenda?data=${data}&sucesso=criada`);
};
