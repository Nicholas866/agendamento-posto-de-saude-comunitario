import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./config";

/**
 * Cliente Supabase para uso em componentes de navegador ("use client").
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient(url, anonKey);
}
