"use server";

import { redirect } from "next/navigation";

import {
  dataDentroDoLimite,
  dataSP,
  estaNoFuturo,
  hojeSP,
} from "@/lib/datahora";
import { buscarConsultaParaAcao } from "@/lib/dados/consultas";
import { buscarHorario } from "@/lib/dados/horarios";
import { buscarPaciente } from "@/lib/dados/pacientes";
import { exigirPapel } from "@/lib/auth";
import { chaveErroCancelamento, mensagemDeErroBanco } from "@/lib/erros";
import { createClient } from "@/lib/supabase/server";
import { UUID_REGEX, type AcaoFormulario } from "@/lib/tipos";
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

type Retorno = "agenda" | "detalhe";

function normalizarRetorno(valor: unknown): Retorno {
  return valor === "detalhe" ? "detalhe" : "agenda";
}

function destinoSucesso(
  id: string,
  dataConsulta: string,
  retorno: Retorno,
  sucesso: string,
): string {
  return retorno === "detalhe"
    ? `/consultas/${id}?sucesso=${sucesso}`
    : `/agenda?data=${dataConsulta}&sucesso=${sucesso}`;
}

function destinoErro(
  id: string,
  dataConsulta: string,
  retorno: Retorno,
  erro: string,
): string {
  return retorno === "detalhe"
    ? `/consultas/${id}?erro=${erro}`
    : `/agenda?data=${dataConsulta}&erro=${erro}`;
}

export async function cancelarConsulta(formData: FormData) {
  await exigirPapel("recepcao", "profissional", "admin");

  const id = String(formData.get("id") ?? "");
  const retorno = normalizarRetorno(formData.get("retorno"));

  if (!UUID_REGEX.test(id)) {
    redirect("/agenda?erro=invalido");
  }

  const consulta = await buscarConsultaParaAcao(id);

  if (!consulta) {
    redirect("/agenda?erro=invalido");
  }

  const dataConsulta = dataSP(consulta.inicio);

  if (consulta.status !== "agendada" && consulta.status !== "confirmada") {
    redirect(destinoErro(id, dataConsulta, retorno, "status"));
  }

  if (!estaNoFuturo(consulta.inicio)) {
    redirect(destinoErro(id, dataConsulta, retorno, "passado"));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancelar_consulta", { p_id: id });

  if (error) {
    redirect(
      destinoErro(id, dataConsulta, retorno, chaveErroCancelamento(error)),
    );
  }

  redirect(destinoSucesso(id, dataConsulta, retorno, "cancelada"));
}

export async function marcarPresenca(formData: FormData) {
  await exigirPapel("recepcao", "admin");

  const id = String(formData.get("id") ?? "");
  const resultado = String(formData.get("resultado") ?? "");
  const retorno = normalizarRetorno(formData.get("retorno"));

  if (
    !UUID_REGEX.test(id) ||
    (resultado !== "realizada" && resultado !== "faltou")
  ) {
    redirect("/agenda?erro=invalido");
  }

  const consulta = await buscarConsultaParaAcao(id);

  if (!consulta) {
    redirect("/agenda?erro=invalido");
  }

  const dataConsulta = dataSP(consulta.inicio);

  if (consulta.status !== "agendada" && consulta.status !== "confirmada") {
    redirect(destinoErro(id, dataConsulta, retorno, "status"));
  }

  if (dataConsulta > hojeSP()) {
    redirect(destinoErro(id, dataConsulta, retorno, "futuro"));
  }

  const supabase = await createClient();
  const { data: atualizadas, error } = await supabase
    .from("consultas")
    .update({ status: resultado })
    .eq("id", id)
    .in("status", ["agendada", "confirmada"])
    .select("id");

  if (error) {
    redirect(destinoErro(id, dataConsulta, retorno, "salvar"));
  }

  if (!atualizadas || atualizadas.length === 0) {
    redirect(destinoErro(id, dataConsulta, retorno, "status"));
  }

  redirect(destinoSucesso(id, dataConsulta, retorno, resultado));
}

export async function desfazerPresenca(formData: FormData) {
  await exigirPapel("recepcao", "admin");

  const id = String(formData.get("id") ?? "");
  const retorno = normalizarRetorno(formData.get("retorno"));

  if (!UUID_REGEX.test(id)) {
    redirect("/agenda?erro=invalido");
  }

  const consulta = await buscarConsultaParaAcao(id);

  if (!consulta) {
    redirect("/agenda?erro=invalido");
  }

  const dataConsulta = dataSP(consulta.inicio);

  if (consulta.status !== "realizada" && consulta.status !== "faltou") {
    redirect(destinoErro(id, dataConsulta, retorno, "status"));
  }

  if (dataConsulta > hojeSP()) {
    redirect(destinoErro(id, dataConsulta, retorno, "futuro"));
  }

  const supabase = await createClient();
  const { data: atualizadas, error } = await supabase
    .from("consultas")
    .update({ status: "agendada" })
    .eq("id", id)
    .in("status", ["realizada", "faltou"])
    .select("id");

  if (error) {
    redirect(destinoErro(id, dataConsulta, retorno, "salvar"));
  }

  if (!atualizadas || atualizadas.length === 0) {
    redirect(destinoErro(id, dataConsulta, retorno, "status"));
  }

  redirect(destinoSucesso(id, dataConsulta, retorno, "desfeita"));
}
