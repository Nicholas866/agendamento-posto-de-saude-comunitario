import { createClient } from "@/lib/supabase/server";
import type { Profissional } from "@/lib/tipos";
import { UUID_REGEX } from "@/lib/tipos";

export async function listarProfissionais(): Promise<Profissional[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profissionais")
    .select("*")
    .order("ativo", { ascending: false })
    .order("nome", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os profissionais.");
  }

  return (data ?? []) as Profissional[];
}

export async function listarProfissionaisAtivos(): Promise<Profissional[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profissionais")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os profissionais ativos.");
  }

  return (data ?? []) as Profissional[];
}

export async function buscarProfissional(
  id: string,
): Promise<Profissional | null> {
  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profissionais")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o profissional.");
  }

  return (data as Profissional | null) ?? null;
}
