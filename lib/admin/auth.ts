import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { ACCESS, ADMIN_ROUTES, decideAccess } from "@/lib/admin/route-guard";

export interface AdminContext {
  supabase: SupabaseClient;
  userId: string;
  email: string;
}

/**
 * Capa de acceso a datos (DAL) del panel: verifica la sesión (firma del JWT) y la
 * pertenencia a la allowlist. Va en CADA página /admin y en CADA Server Action; el
 * proxy es solo una comprobación optimista. `auth.users` es compartido con otras
 * apps, así que estar autenticado NO implica ser admin.
 *
 * No cierra sesión (un Server Component no puede escribir cookies): un usuario
 * autenticado que no es admin va a /admin/sin-acceso, donde puede salir.
 * Debe llamarse bajo <Suspense> (lee cookies).
 */
export async function requireAdmin(): Promise<AdminContext> {
  // getClaims() valida la expiración con Date.now(); con cacheComponents y
  // partialPrefetching eso rompe el prerender. connection() difiere todo a una
  // petición real del usuario: el control de acceso nunca corre en un prefetch.
  await connection();
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  let isAdmin = false;
  if (claims) {
    const { data: rpcData, error } = await supabase.rpc("chorri_is_admin");
    isAdmin = !error && rpcData === true;
  }

  const decision = decideAccess(Boolean(claims), isAdmin);
  if (decision === ACCESS.login) redirect(ADMIN_ROUTES.login);
  if (decision === ACCESS.forbidden) redirect(ADMIN_ROUTES.forbidden);

  return {
    supabase,
    userId: String(claims?.sub ?? ""),
    email: typeof claims?.email === "string" ? claims.email : "",
  };
}
