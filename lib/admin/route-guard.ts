// Decisiones PURAS de acceso al panel. Sin dependencias de Next ni de Supabase
// para poder probarlas con Vitest; el proxy y requireAdmin() solo las aplican.

export const ADMIN_ROUTES = {
  home: "/admin",
  login: "/admin/login",
  // Destino de usuarios autenticados que NO están en la allowlist (evita el bucle
  // login <-> panel: aquí un usuario con sesión no es redirigido a ninguna parte).
  forbidden: "/admin/sin-acceso",
} as const;

export const ACCESS = {
  login: "login",
  forbidden: "forbidden",
  allow: "allow",
} as const;

export type AccessDecision = (typeof ACCESS)[keyof typeof ACCESS];

// Quita barras finales (salvo la raíz) para comparar rutas de forma estable.
function normalize(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

/**
 * Verificación OPTIMISTA del proxy (solo mira si hay claims, no consulta la BD).
 * Devuelve la ruta de destino o `null` si la petición sigue su curso.
 */
export function decideAdminRedirect(pathname: string, hasClaims: boolean): string | null {
  const path = normalize(pathname);
  if (path === ADMIN_ROUTES.login) return hasClaims ? ADMIN_ROUTES.home : null;
  return hasClaims ? null : ADMIN_ROUTES.login;
}

/** Decisión de requireAdmin(): claims verificados + pertenencia a la allowlist. */
export function decideAccess(hasClaims: boolean, isAdmin: boolean): AccessDecision {
  if (!hasClaims) return ACCESS.login;
  return isAdmin ? ACCESS.allow : ACCESS.forbidden;
}
