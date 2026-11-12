import { intervaloDoDia } from "@/lib/datahora";
import { createClient } from "@/lib/supabase/server";
import type {
  ConsultaAgenda,
  ConsultaDetalhe,
  StatusConsulta,
} from "@/lib/tipos";
import { UUID_REGEX } from "@/lib/tipos";

type ProfissionalEmbutido = {
  nome: string;
  especialidade: string;
};

type PacienteEmbutido = {
  nome: string;
};

type LinhaHorarioComConsultas = {
  inicio: string;
  fim: string;
  profissional_id: string;
  profissionais: ProfissionalEmbutido | ProfissionalEmbutido[] | null;
  consultas:
    | Array<{
        id: string;
        status: StatusConsulta;
        paciente_id: string;
        pacientes: PacienteEmbutido | PacienteEmbutido[] | null;
      }>
    | null;
};

function primeiro<T>(valor: T | T[] | null): T | null {
  if (Array.isArray(valor)) {
    return valor[0] ?? null;
  }

  return valor;
}

export async function listarConsultasDoDia(
  data: string,
): Promise<ConsultaAgenda[]> {
  const { inicio, fim } = intervaloDoDia(data);
  const supabase = await createClient();

  const { data: linhas, error } = await supabase
    .from("horarios")
    .select(
      "inicio, fim, profissional_id, profissionais(nome, especialidade), consultas(id, status, paciente_id, pacientes(nome))",
    )
    .gte("inicio", inicio)
    .lt("inicio", fim)
    .order("inicio", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar a agenda do dia.");
  }

  const consultas: ConsultaAgenda[] = [];

  for (const linha of (linhas ?? []) as unknown as LinhaHorarioComConsultas[]) {
    const profissional = primeiro(linha.profissionais);

    for (const consulta of linha.consultas ?? []) {
      const paciente = primeiro(consulta.pacientes);

      consultas.push({
        id: consulta.id,
        status: consulta.status,
        paciente_nome: paciente?.nome ?? "Paciente não encontrado",
        profissional_id: linha.profissional_id,
        profissional_nome: profissional?.nome ?? "Profissional não encontrado",
        especialidade: profissional?.especialidade ?? "",
        inicio: linha.inicio,
        fim: linha.fim,
      });
    }
  }

  consultas.sort((a, b) => {
    const porInicio = a.inicio.localeCompare(b.inicio);
    if (porInicio !== 0) {
      return porInicio;
    }

    return a.profissional_nome.localeCompare(b.profissional_nome, "pt-BR");
  });

  return consultas;
}

type PacienteDetalheEmbutido = {
  id: string;
  nome: string;
  cpf_ou_cartao_sus: string;
  telefone: string;
  email: string | null;
};

type HorarioDetalheEmbutido = {
  id: string;
  inicio: string;
  fim: string;
  profissional_id: string;
  profissionais: ProfissionalEmbutido | ProfissionalEmbutido[] | null;
};

type LinhaConsultaDetalhe = {
  id: string;
  status: StatusConsulta;
  criado_em: string;
  atualizado_em: string;
  pacientes: PacienteDetalheEmbutido | PacienteDetalheEmbutido[] | null;
  horarios: HorarioDetalheEmbutido | HorarioDetalheEmbutido[] | null;
};

type HorarioDaConsulta = {
  inicio: string;
};

type LinhaConsultaParaAcao = {
  id: string;
  status: StatusConsulta;
  horario_id: string;
  horarios: HorarioDaConsulta | HorarioDaConsulta[] | null;
};

export type ConsultaParaAcao = {
  id: string;
  status: StatusConsulta;
  horario_id: string;
  inicio: string;
};

/** Detalhe completo para a tela de consulta. */
export async function buscarConsultaDetalhe(
  id: string,
): Promise<ConsultaDetalhe | null> {
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultas")
    .select(
      "id, status, criado_em, atualizado_em, pacientes(id, nome, cpf_ou_cartao_sus, telefone, email), horarios(id, inicio, fim, profissional_id, profissionais(nome, especialidade))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a consulta.");
  }

  if (!data) {
    return null;
  }

  const linha = data as unknown as LinhaConsultaDetalhe;
  const paciente = primeiro(linha.pacientes);
  const horario = primeiro(linha.horarios);
  const profissional = horario ? primeiro(horario.profissionais) : null;

  if (!paciente || !horario) {
    return null;
  }

  return {
    id: linha.id,
    status: linha.status,
    criado_em: linha.criado_em,
    atualizado_em: linha.atualizado_em,
    paciente,
    horario: {
      id: horario.id,
      inicio: horario.inicio,
      fim: horario.fim,
      profissional_id: horario.profissional_id,
      profissional_nome: profissional?.nome ?? "Profissional não encontrado",
      especialidade: profissional?.especialidade ?? "",
    },
  };
}

/**
 * Dados mínimos para as ações de cancelar/presença.
 * Não carrega CPF, telefone ou e-mail (LGPD).
 */
export async function buscarConsultaParaAcao(
  id: string,
): Promise<ConsultaParaAcao | null> {
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultas")
    .select("id, status, horario_id, horarios(inicio)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a consulta.");
  }

  if (!data) {
    return null;
  }

  const linha = data as unknown as LinhaConsultaParaAcao;
  const horario = primeiro(linha.horarios);

  if (!horario) {
    return null;
  }

  return {
    id: linha.id,
    status: linha.status,
    horario_id: linha.horario_id,
    inicio: horario.inicio,
  };
}
