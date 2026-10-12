import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Se aceptan ambos nombres de variable: el nuevo (publishable) y el legacy (anon).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && KEY);
}

let cached: SupabaseClient | null = null;

/**
 * Cliente Supabase de SOLO LECTURA (publishable/anon key + RLS).
 *
 * Isomorfo: sirve tanto en Server Components como en el navegador.
 * No gestiona sesiones (`persistSession: false`) porque el catálogo es
 * público y no hay autenticación. La escritura queda fuera de alcance
 * (usaría la secret key, server-only).
 */
export function createSupabase(): SupabaseClient {
  if (!URL || !KEY) {
    throw new Error(
      "Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }
  if (!cached) {
    cached = createClient(URL, KEY, { auth: { persistSession: false } });
  }
  return cached;
}
