import { PRODUCTS } from "@/data/products";
import { productSchema, type Product } from "./product-schema";

/**
 * Capa de acceso a datos del catálogo.
 *
 * ORIGEN ACTUAL: estático (`data/products.ts`), validado con Zod al cargar.
 * Las filas inválidas se descartan con warning en desarrollo — nunca rompen la UI.
 *
 * MIGRACIÓN A SUPABASE: solo cambia este fichero:
 *   const supabase = createClient(...);
 *   export async function getProducts() {
 *     const { data } = await supabase.from("productos").select("*");
 *     return validateRows(data ?? []);
 *   }
 * Las firmas async ya están listas y el resto de la app no se toca.
 */

function validateRows(rows: unknown[]): Product[] {
  const valid: Product[] = [];
  for (const row of rows) {
    const parsed = productSchema.safeParse(row);
    if (parsed.success) {
      valid.push(parsed.data);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[catalog] fila inválida descartada:",
        (row as { id?: unknown })?.id,
        parsed.error.issues
      );
    }
  }
  return valid;
}

const CATALOG: Product[] = validateRows(PRODUCTS);

export const VALID_PRODUCT_IDS = new Set(CATALOG.map((p) => p.id));

/** Lista validada para componentes cliente (el Catalog actual filtra en cliente). */
export function getCatalogSync(): Product[] {
  return CATALOG;
}

/** Firma lista para Supabase: paginación y búsqueda vivirán aquí. */
export async function getProducts(): Promise<Product[]> {
  return CATALOG;
}

export async function getProductById(id: string): Promise<Product | null> {
  return CATALOG.find((p) => p.id === id) ?? null;
}
