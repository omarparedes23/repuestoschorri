import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";
import { decideAdminRedirect } from "@/lib/admin/route-guard";

/**
 * Proxy SOLO para /admin: refresca la sesión y hace redirecciones optimistas
 * (sin claims -> login). No consulta la BD: la allowlist se verifica en
 * requireAdmin(). Las rutas públicas no pasan por aquí.
 */
export async function proxy(request: NextRequest) {
  const { response, hasClaims } = await updateSession(request);
  const target = decideAdminRedirect(request.nextUrl.pathname, hasClaims);
  if (!target) return response;

  const redirectResponse = NextResponse.redirect(new URL(target, request.url));
  // Conservar las cookies (y cabeceras anti-caché) de la sesión refrescada.
  for (const cookie of response.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }
  response.headers.forEach((value, name) => {
    if (name === "cache-control" || name === "expires" || name === "pragma") {
      redirectResponse.headers.set(name, value);
    }
  });
  return redirectResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
