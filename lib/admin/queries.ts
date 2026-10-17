import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminProductRow } from "@/lib/admin/product-form";

// Lecturas del panel con la sesión del admin (RLS: ve también los inactivos).
// Reciben el cliente que devuelve requireAdmin(): nunca crean uno propio.

export interface AdminListItem {
  id: string;
  name: string;
  code: string;
  oemCode: string;
  category: string;
  active: boolean;
  image: string | null;
}

export interface CategoryOption {
  id: string;
  nombre: string;
}

export interface BrandOption {
  id: string;
  nombre: string;
  activa: boolean;
}

const LIST_SELECT = "id,nombre,codigo,oem,imagen,activo,categoria:chorri_categorias(nombre)";
const ROW_SELECT =
  "id,slug,nombre,codigo,oem,categoria_id,compatibilidad,disponibilidad,imagen,precio,moneda,precio_nota,garantia,especificaciones,descripcion,activo,marcas:chorri_producto_marcas(marca_id)";

// Longitud del prefijo con el que se buscan colisiones de slug: los candidatos con
// sufijo (-2, -3...) truncan la base, pero siempre conservan estos primeros caracteres.
const SLUG_PREFIX_LENGTH = 50;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function categoryName(value: unknown): string {
  const one = Array.isArray(value) ? value[0] : value;
  return one && typeof one === "object" ? asString((one as Record<string, unknown>).nombre) : "";
}

/** Todos los productos (activos e inactivos), ordenados por nombre. */
export async function listAdminProducts(supabase: SupabaseClient): Promise<AdminListItem[]> {
  const { data, error } = await supabase
    .from("chorri_productos")
    .select(LIST_SELECT)
    .order("nombre", { ascending: true });
  if (error) throw new Error(`Supabase listAdminProducts: ${error.message}`);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: asString(row.id),
    name: asString(row.nombre),
    code: asString(row.codigo),
    oemCode: asString(row.oem),
    category: categoryName(row.categoria),
    active: row.activo === true,
    image: typeof row.imagen === "string" && row.imagen.length > 0 ? row.imagen : null,
  }));
}

/** Producto crudo por id (null si no existe). */
export async function getAdminProduct(
  supabase: SupabaseClient,
  id: string,
): Promise<AdminProductRow | null> {
  const { data, error } = await supabase
    .from("chorri_productos")
    .select(ROW_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Supabase getAdminProduct: ${error.message}`);
  return (data as AdminProductRow | null) ?? null;
}

export async function listCategories(supabase: SupabaseClient): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from("chorri_categorias")
    .select("id,nombre")
    .order("orden", { ascending: true });
  if (error) throw new Error(`Supabase listCategories: ${error.message}`);
  return (data ?? []) as CategoryOption[];
}

export async function listBrands(supabase: SupabaseClient): Promise<BrandOption[]> {
  const { data, error } = await supabase
    .from("chorri_marcas")
    .select("id,nombre,activa")
    .order("nombre", { ascending: true });
  if (error) throw new Error(`Supabase listBrands: ${error.message}`);
  return (data ?? []) as BrandOption[];
}

/**
 * ids y slugs que empiezan igual que `base` (que solo contiene [a-z0-9-]: sin
 * comodines de LIKE). Alimenta a nextAvailableSlug().
 */
export async function listTakenSlugs(supabase: SupabaseClient, base: string): Promise<Set<string>> {
  const prefix = base.slice(0, SLUG_PREFIX_LENGTH);
  const { data, error } = await supabase
    .from("chorri_productos")
    .select("id,slug")
    .or(`id.like.${prefix}*,slug.like.${prefix}*`);
  if (error) throw new Error(`Supabase listTakenSlugs: ${error.message}`);
  const taken = new Set<string>();
  for (const row of (data ?? []) as { id: string; slug: string | null }[]) {
    taken.add(row.id);
    if (row.slug) taken.add(row.slug);
  }
  return taken;
}
