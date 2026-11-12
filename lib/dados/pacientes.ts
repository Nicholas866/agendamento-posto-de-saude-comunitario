import { createClient } from "@/lib/supabase/server";
import type { Paciente } from "@/lib/tipos";
import { UUID_REGEX } from "@/lib/tipos";

const LIMITE_PADRAO = 50;

/** Remove caracteres que quebram o filtro do PostgREST. */
function sanitizarTermo(termo: string): string {
  return termo
    .trim()
    .replace(/[%_,()*\\]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function listarPacientes(
  termo: string,
  limite = LIMITE_PADRAO,
): Promise<Paciente[]> {
  const supabase = await createClient();
  const busca = sanitizarTermo(termo);

  let consulta = supabase
    .from("pacientes")
    .select("*")
    .order("nome", { ascending: true })
    .limit(limite);

  if (busca) {
    const digitos = busca.replace(/\D/g, "");

    consulta =
      digitos.length >= 3
        ? consulta.or(
            `nome.ilike.%${busca}%,cpf_ou_cartao_sus.ilike.%${digitos}%`,
          )
        : consulta.ilike("nome", `%${busca}%`);
  }

  const { data, error } = await consulta;

  if (error) {
    throw new Error("Não foi possível carregar os pacientes.");
  }

  return (data ?? []) as Paciente[];
}

export async function buscarPaciente(id: string): Promise<Paciente | null> {
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o paciente.");
  }

  return (data as Paciente | null) ?? null;
}
