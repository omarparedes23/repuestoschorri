// Lectura de claves para los clientes del panel (misma lógica que lib/supabase.ts).
// Las variables NEXT_PUBLIC_* deben referenciarse de forma estática para que Next
// las inyecte también en el bundle del navegador.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseEnv(): { url: string; key: string } {
  if (!URL || !KEY) {
    throw new Error(
      "Supabase no configurado: define NEXT_PUBLIC_SUPABASE_URL y " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }
  return { url: URL, key: KEY };
}
