"use server";

import { redirect } from "next/navigation";

import { dataSP } from "@/lib/datahora";
import { buscarProfissional } from "@/lib/dados/profissionais";
import {
  contarConsultasAtivasDoHorario,
  horariosExistentesNoIntervalo,
  type HorarioComConsultas,
} from "@/lib/dados/horarios";
import { exigirPapel } from "@/lib/auth";
import { mensagemDeErroBanco } from "@/lib/erros";
import { createClient } from "@/lib/supabase/server";
import type { AcaoFormulario } from "@/lib/tipos";
import { UUID_REGEX } from "@/lib/tipos";
import { validarLiberacaoHorarios } from "@/lib/validacao-agenda";

export const liberarHorarios: AcaoFormulario = async (_estado, formData) => {
  await exigirPapel("recepcao", "admin");

  const valores = Object.fromEntries(formData) as Record<string, string>;
  const { erros, dados } = validarLiberacaoHorarios(valores);

  if (Object.keys(erros).length > 0 || !dados) {
    return { ok: false, erros, valores };
  }

  const profissional = await buscarProfissional(dados.profissional_id);

  if (!profissional || !profissional.ativo) {
    return {
      ok: false,
      erros: {
        profissional_id:
          "Este profissional não está ativo. Escolha um profissional ativo.",
      },
      valores,
    };
  }

  const primeiroInicio = dados.slots[0].inicio;
  const ultimoFim = dados.slots[dados.slots.length - 1].fim;
  const existentes = await horariosExistentesNoIntervalo(
    dados.profissional_id,
    primeiroInicio,
    ultimoFim,
  );

  const porInicio = new Map<string, HorarioComConsultas>();
  const intervalosOcupados: Array<{ inicio: number; fim: number }> = [];

  for (const horario of existentes) {
    porInicio.set(new Date(horario.inicio).toISOString(), horario);

    if (!horario.removido_em) {
      intervalosOcupados.push({
        inicio: new Date(horario.inicio).getTime(),
        fim: new Date(horario.fim).getTime(),
      });
    }
  }

  const novos: Array<{
    profissional_id: string;
    inicio: string;
    fim: string;
  }> = [];
  const reativar: Array<{ id: string; fim: string }> = [];
  let ignorados = 0;

  for (const slot of dados.slots) {
    const chave = new Date(slot.inicio).toISOString();
    const existente = porInicio.get(chave);

    if (existente) {
      if (existente.removido_em) {
        const temConsultaAtiva = (existente.consultas ?? []).some(
          (consulta) => consulta.status !== "cancelada",
        );
        const inicioMs = new Date(slot.inicio).getTime();
        const fimMs = new Date(slot.fim).getTime();
        const sobrepoe = intervalosOcupados.some(
          (intervalo) => inicioMs < intervalo.fim && fimMs > intervalo.inicio,
        );

        if (temConsultaAtiva || sobrepoe) {
          ignorados += 1;
        } else {
          reativar.push({ id: existente.id, fim: slot.fim });
          intervalosOcupados.push({ inicio: inicioMs, fim: fimMs });
        }
      } else {
        ignorados += 1;
      }

      continue;
    }

    const inicioMs = new Date(slot.inicio).getTime();
    const fimMs = new Date(slot.fim).getTime();
    const sobrepoe = intervalosOcupados.some(
      (intervalo) => inicioMs < intervalo.fim && fimMs > intervalo.inicio,
    );

    if (sobrepoe) {
      ignorados += 1;
      continue;
    }

    novos.push({
      profissional_id: dados.profissional_id,
      inicio: slot.inicio,
      fim: slot.fim,
    });
    intervalosOcupados.push({ inicio: inicioMs, fim: fimMs });
  }

  const supabase = await createClient();

  if (novos.length > 0) {
    const { error } = await supabase.from("horarios").upsert(novos, {
      onConflict: "profissional_id,inicio",
      ignoreDuplicates: true,
    });

    if (error) {
      return {
        ok: false,
        erros: {
          geral: mensagemDeErroBanco(
            error,
            "Um ou mais horários já estavam liberados.",
          ),
        },
        valores,
      };
    }
  }

  let reativados = 0;

  for (const item of reativar) {
    const { error } = await supabase
      .from("horarios")
      .update({ fim: item.fim, status: "livre", removido_em: null })
      .eq("id", item.id);

    if (error) {
      return {
        ok: false,
        erros: { geral: mensagemDeErroBanco(error) },
        valores,
      };
    }

    reativados += 1;
  }

  const parametros = new URLSearchParams({
    profissional: dados.profissional_id,
    data: dados.data,
    criados: String(novos.length),
    reativados: String(reativados),
    ignorados: String(ignorados),
  });

  // O redirect mantém o formulário na mesma data/profissional depois de salvar.
  redirect(`/horarios?${parametros.toString()}`);
};

export async function removerHorario(formData: FormData) {
  await exigirPapel("recepcao", "admin");

  const id = String(formData.get("id") ?? "");

  if (!UUID_REGEX.test(id)) {
    redirect("/horarios?erro=invalido");
  }

  const supabase = await createClient();
  const { data: horario, error } = await supabase
    .from("horarios")
    .select("id, profissional_id, inicio, status, removido_em")
    .eq("id", id)
    .maybeSingle();

  if (error || !horario) {
    redirect("/horarios?erro=invalido");
  }

  const filtros = new URLSearchParams({
    profissional: horario.profissional_id,
    data: dataSP(horario.inicio),
  });

  if (horario.removido_em || horario.status !== "livre") {
    filtros.set("erro", "ocupado");
    redirect(`/horarios?${filtros.toString()}`);
  }

  const consultasAtivas = await contarConsultasAtivasDoHorario(id);

  if (consultasAtivas > 0) {
    filtros.set("erro", "ocupado");
    redirect(`/horarios?${filtros.toString()}`);
  }

  const { error: erroAoRemover } = await supabase
    .from("horarios")
    .update({ removido_em: new Date().toISOString() })
    .eq("id", id);

  if (erroAoRemover) {
    filtros.set("erro", "salvar");
    redirect(`/horarios?${filtros.toString()}`);
  }

  filtros.set("sucesso", "removido");
  redirect(`/horarios?${filtros.toString()}`);
}
