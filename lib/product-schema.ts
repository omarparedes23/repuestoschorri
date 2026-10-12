import { z } from "zod";

/**
 * Fuente de verdad del dominio.
 *
 * Conviven DOS formas:
 *  - Producto de dominio (`productSchema`): identificadores en inglés, es lo
 *    que consume la UI.
 *  - Fila cruda de Supabase (columnas en español + joins): se traduce con
 *    `rowToProduct` en el boundary del repositorio (`lib/products.ts`).
 *
 * Las filas que no cumplen el contrato se descartan con warning en desarrollo;
 * nunca rompen la UI.
 */

export const availabilitySchema = z.enum([
  "En stock inmediato",
  "Envío hoy",
  "Bajo pedido",
]);

export const productSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

/** Producto de dominio (lo que usa la UI). */
export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  oemCode: z.string().min(1),
  category: z.string().min(1),
  brands: z.array(z.string().min(1)),
  compatibility: z.string().min(1),
  availability: availabilitySchema,
  image: z.string().min(1).nullable(),
  price: z.number().nullable(),
  currency: z.string().min(1),
  priceNote: z.string().min(1).optional(),
  warranty: z.string().min(1),
  specs: z.array(productSpecSchema),
  description: z.string().optional(),
});

export const cartLineSchema = z.object({
  id: z.string().min(1),
  qty: z.number().int().min(1).max(99),
});

export type Category = string;
export type Availability = z.infer<typeof availabilitySchema>;
export type ProductSpec = z.infer<typeof productSpecSchema>;
export type Product = z.infer<typeof productSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;

export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Columnas + recursos embebidos que pedimos a PostgREST para armar un Product.
 * El join trae el nombre de la categoría y los nombres de las marcas (N:M).
 */
export const PRODUCT_SELECT = [
  "id",
  "slug",
  "nombre",
  "codigo",
  "oem",
  "compatibilidad",
  "disponibilidad",
  "imagen",
  "precio",
  "moneda",
  "precio_nota",
  "garantia",
  "especificaciones",
  "descripcion",
  "categoria:chorri_categorias(nombre)",
  "marcas:chorri_producto_marcas(chorri_marcas(nombre))",
].join(",");

type Json = Record<string, unknown>;

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toText(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Traduce una fila cruda de Supabase al Producto de dominio (o null). */
export function rowToProduct(row: unknown): Product | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Json;

  const categoria = pickOne(r.categoria as Json | Json[] | null);
  const categoriaNombre =
    categoria && typeof categoria.nombre === "string"
      ? categoria.nombre
      : undefined;
  const marcasRaw = Array.isArray(r.marcas) ? (r.marcas as Json[]) : [];
  const brands = marcasRaw
    .map((m) => pickOne(m.chorri_marcas as Json | Json[] | null)?.nombre)
    .filter((n): n is string => typeof n === "string" && n.length > 0);

  const candidate = {
    id: r.id,
    slug: toText(r.slug),
    name: r.nombre,
    code: r.codigo,
    oemCode: r.oem,
    category: categoriaNombre,
    brands,
    compatibility: r.compatibilidad,
    availability: r.disponibilidad,
    image: toText(r.imagen) ?? null,
    price: toNumber(r.precio),
    currency: toText(r.moneda) ?? "PEN",
    priceNote: toText(r.precio_nota),
    warranty: r.garantia,
    specs: Array.isArray(r.especificaciones) ? r.especificaciones : [],
    description: toText(r.descripcion),
  };

  const parsed = productSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
