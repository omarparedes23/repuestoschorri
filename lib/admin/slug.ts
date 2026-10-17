// Generación de id/slug a partir del nombre. Funciones PURAS (sin BD): la acción
// consulta los ocupados y se los pasa a nextAvailableSlug.

export const SLUG_MAX_LENGTH = 60;

/**
 * minúsculas, sin acentos ni ñ, todo lo no alfanumérico -> "-", sin guiones
 * repetidos ni en los extremos, máximo 60 caracteres. Si no queda nada utilizable
 * devuelve "" (el esquema lo rechaza; no hay fallback para evitar slugs basura).
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

/**
 * Primer slug libre: `base`, `base-2`, `base-3`... `taken` mezcla ids y slugs
 * existentes (ambos son únicos en la tabla). El sufijo se aplica tras truncar la
 * base, así el total nunca pasa de 60.
 */
export function nextAvailableSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const suffix = `-${n}`;
    const stem = base.slice(0, SLUG_MAX_LENGTH - suffix.length).replace(/-+$/, "");
    const candidate = `${stem}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}
