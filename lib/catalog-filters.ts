import type { Availability, Category } from "@/types/product";

export const ALL_CATEGORIES = "Todas las categorías";
export const ALL_BRANDS = "Todas las marcas";
export const ALL_AVAILABILITY = "Cualquier disponibilidad";

/** Tamaño de página del catálogo. Al migrar a Supabase se usa en .range(). */
export const PAGE_SIZE = 12;

export interface CatalogFilters {
  brand: string;
  category: Category | typeof ALL_CATEGORIES;
  query: string;
  availability: Availability | typeof ALL_AVAILABILITY;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  brand: "",
  category: ALL_CATEGORIES,
  query: "",
  availability: ALL_AVAILABILITY,
};

export function parseCatalogParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): CatalogFilters {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) return params.get(key) ?? "";
    const v = params[key];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };
  const brand = get("marca").trim();
  const categoryRaw = get("categoria").trim();
  const query = get("q").trim();
  const availabilityRaw = get("estado").trim();
  return {
    brand,
    category: (categoryRaw || ALL_CATEGORIES) as CatalogFilters["category"],
    query,
    availability: (availabilityRaw ||
      ALL_AVAILABILITY) as CatalogFilters["availability"],
  };
}

export function buildCatalogQuery(
  filters: Partial<CatalogFilters> & { page?: number }
): string {
  const sp = new URLSearchParams();
  if (filters.brand) sp.set("marca", filters.brand);
  if (filters.category && filters.category !== ALL_CATEGORIES)
    sp.set("categoria", filters.category);
  if (filters.query) sp.set("q", filters.query);
  if (filters.availability && filters.availability !== ALL_AVAILABILITY)
    sp.set("estado", filters.availability);
  if (filters.page && filters.page > 1) sp.set("pagina", String(filters.page));
  const qs = sp.toString();
  return qs ? `/?${qs}#catalogo` : "/#catalogo";
}

/** Página 1-indexada, siempre >= 1 aunque la URL traiga basura. */
export function parsePage(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): number {
  const raw =
    params instanceof URLSearchParams
      ? (params.get("pagina") ?? "")
      : (() => {
          const v = params["pagina"];
          return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
        })();
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
