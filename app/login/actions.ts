"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function entrar(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    redirect("/login?erro=campos");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    redirect("/login?erro=credenciais");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?erro=credenciais");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("papel")
    .eq("id", user.id)
    .maybeSingle();

  // Usuário sem linha em `perfis` não acessa nada: encerra a sessão.
  if (!perfil) {
    await supabase.auth.signOut();
    redirect("/login?erro=sem-perfil");
  }

  redirect(perfil.papel === "admin" ? "/painel" : "/agenda");
}
