import { createSupabase } from "./supabase";
import { PRODUCT_SELECT, rowToProduct, type Product } from "./product-schema";

/**
 * Capa de acceso a datos del catálogo.
 *
 * ORIGEN: Supabase (tablas `chorri_*`). Cada fila se valida con Zod en este
 * boundary (`rowToProduct`); las filas inválidas se descartan con warning en
 * desarrollo y nunca rompen la UI.
 *
 * La lectura usa la publishable/anon key + RLS (solo filas `activo = true`).
 */

function toProducts(rows: unknown[] | null): Product[] {
  if (!rows) return [];
  const valid: Product[] = [];
  for (const row of rows) {
    const product = rowToProduct(row);
    if (product) {
      valid.push(product);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[catalog] fila inválida descartada:",
        (row as { id?: unknown })?.id
      );
    }
  }
  return valid;
}

/** Catálogo completo activo, ordenado por nombre. */
export async function getProducts(): Promise<Product[]> {
  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("chorri_productos")
    .select(PRODUCT_SELECT)
    .eq("activo", true)
    .order("nombre", { ascending: true });
  if (error) throw new Error(`Supabase getProducts: ${error.message}`);
  return toProducts(data);
}

/**
 * Productos por id — usado por el carrito para rehidratar `{id, qty}` sin
 * persistir el Product completo. No lanza: ante fallo devuelve [].
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("chorri_productos")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .eq("activo", true);
  if (error) {
    console.warn("[catalog] getProductsByIds:", error.message);
    return [];
  }
  return toProducts(data);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createSupabase();
  const { data, error } = await supabase
    .from("chorri_productos")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();
  if (error) throw new Error(`Supabase getProductById: ${error.message}`);
  return data ? rowToProduct(data) : null;
}
