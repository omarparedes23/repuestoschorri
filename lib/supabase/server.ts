import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase con la SESIÓN del usuario (cookies). Uno por request: nunca
 * se cachea ni se comparte (llamar `cookies()` lo hace dinámico, así que debe
 * usarse bajo <Suspense> o dentro de una Server Action).
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // En un Server Component `set` lanza (solo se puede escribir en Server
        // Actions / Route Handlers). Es seguro ignorarlo: el proxy ya refresca
        // la sesión en cada navegación a /admin.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Contexto de solo lectura.
        }
      },
    },
  });
}
