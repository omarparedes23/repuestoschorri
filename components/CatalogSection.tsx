import { Catalog } from "./Catalog";
import { getProducts } from "@/lib/products";
import type { Product } from "@/types/product";

/**
 * Server Component que lee el catálogo desde Supabase y lo entrega al
 * `Catalog` (cliente). Va dentro de `<Suspense>` en la página: datos sin
 * cachear en un agujero dinámico, con el shell estático intacto.
 */
export async function CatalogSection() {
  let catalog: Product[] = [];
  try {
    catalog = await getProducts();
  } catch (error) {
    console.error("[catalog] no se pudo cargar desde Supabase:", error);
  }
  return <Catalog catalog={catalog} />;
}
