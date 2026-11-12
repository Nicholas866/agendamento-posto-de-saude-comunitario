import { intervaloDoDia } from "@/lib/datahora";
import { createClient } from "@/lib/supabase/server";
import type {
  Horario,
  HorarioComProfissional,
  StatusConsulta,
} from "@/lib/tipos";
import { UUID_REGEX } from "@/lib/tipos";

export type HorarioComConsultas = Horario & {
  consultas: Array<{ id: string; status: StatusConsulta }> | null;
};

export async function listarHorariosDoDia(
  profissionalId: string,
  data: string,
): Promise<Horario[]> {
  if (!UUID_REGEX.test(profissionalId)) {
    return [];
  }

  const { inicio, fim } = intervaloDoDia(data);
  const supabase = await createClient();

  const { data: horarios, error } = await supabase
    .from("horarios")
    .select("*")
    .eq("profissional_id", profissionalId)
    .is("removido_em", null)
    .gte("inicio", inicio)
    .lt("inicio", fim)
    .order("inicio", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os horários.");
  }

  return (horarios ?? []) as Horario[];
}

export async function listarHorariosLivres(
  profissionalId: string,
  data: string,
): Promise<Horario[]> {
  if (!UUID_REGEX.test(profissionalId)) {
    return [];
  }

  const { inicio, fim } = intervaloDoDia(data);
  const supabase = await createClient();

  const { data: horarios, error } = await supabase
    .from("horarios")
    .select("*")
    .eq("profissional_id", profissionalId)
    .eq("status", "livre")
    .is("removido_em", null)
    .gte("inicio", inicio)
    .lt("inicio", fim)
    .gt("inicio", new Date().toISOString())
    .order("inicio", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os horários livres.");
  }

  return (horarios ?? []) as Horario[];
}

export async function buscarHorario(
  id: string,
): Promise<HorarioComProfissional | null> {
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horarios")
    .select("*, profissionais(id, nome, especialidade, ativo)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o horário.");
  }

  return (data as HorarioComProfissional | null) ?? null;
}

/**
 * Horários que se sobrepõem ao intervalo, inclusive removidos.
 * Usado ao liberar horários: removidos podem ser reativados; os demais
 * bloqueiam a criação de um horário no mesmo horário/intervalo.
 */
export async function horariosExistentesNoIntervalo(
  profissionalId: string,
  inicioISO: string,
  fimISO: string,
): Promise<HorarioComConsultas[]> {
  if (!UUID_REGEX.test(profissionalId)) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horarios")
    .select("*, consultas(id, status)")
    .eq("profissional_id", profissionalId)
    .lt("inicio", fimISO)
    .gt("fim", inicioISO)
    .order("inicio", { ascending: true });

  if (error) {
    throw new Error("Não foi possível verificar os horários existentes.");
  }

  return (data ?? []) as HorarioComConsultas[];
}

export async function contarConsultasAtivasDoHorario(
  horarioId: string,
): Promise<number> {
  if (!UUID_REGEX.test(horarioId)) {
    return 0;
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("consultas")
    .select("id", { count: "exact", head: true })
    .eq("horario_id", horarioId)
    .neq("status", "cancelada");

  if (error) {
    throw new Error("Não foi possível verificar as consultas do horário.");
  }

  return count ?? 0;
}
