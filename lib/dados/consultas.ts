import { intervaloDoDia } from "@/lib/datahora";
import { createClient } from "@/lib/supabase/server";
import type { ConsultaAgenda, StatusConsulta } from "@/lib/tipos";

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
