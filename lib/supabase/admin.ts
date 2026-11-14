import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./config";

/**
 * Cliente com a chave de serviço do Supabase. Só pode ser importado no
 * servidor (Server Components, Server Actions e Route Handlers).
 *
 * A chave fica em SUPABASE_SERVICE_ROLE_KEY, sem o prefixo NEXT_PUBLIC_,
 * e nunca deve ser exposta ao navegador nem commitada no Git.
 */
export function criarClienteAdmin() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor. Preencha a variável no .env.local.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
