// Re-exporta los tipos del schema (Zod es la fuente de verdad).
// Se mantiene esta ruta para no romper los imports existentes.
// Cuando llegue Supabase, productSchema validará las filas de la DB
// en el boundary del repositorio (lib/products.ts).
export type {
  Category,
  Availability,
  ProductSpec,
  Product,
  CartLine,
  CartItem,
} from "@/lib/product-schema";
