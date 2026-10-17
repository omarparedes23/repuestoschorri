import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export interface SessionUpdate {
  /** Respuesta que ya lleva las cookies de sesión refrescadas. */
  response: NextResponse;
  /** ¿Hay un JWT válido (firma verificada)? No implica que sea admin. */
  hasClaims: boolean;
}

/**
 * Refresca la sesión en el proxy y propaga las cookies nuevas a la petición
 * (para que las vea el render) y a la respuesta (para el navegador).
 * Usa `getClaims()`: verifica la firma del JWT; jamás `getSession()` para decidir.
 */
export async function updateSession(request: NextRequest): Promise<SessionUpdate> {
  const { url, key } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Cabeceras anti-caché que Supabase exige junto a las cookies de sesión.
        for (const [header, value] of Object.entries(headers)) {
          response.headers.set(header, value);
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  return { response, hasClaims: Boolean(data?.claims) };
}
