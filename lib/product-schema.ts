import { z } from "zod";

/**
 * Fuente de verdad del dominio. Hoy valida el catálogo estático y el
 * carrito; cuando llegue Supabase validará las filas de la DB en el
 * boundary del repositorio (lib/products.ts).
 */

export const categorySchema = z.enum([
  "Pernos y Fijaciones",
  "Suspensión",
  "Motor",
  "Frenos",
  "Transmisión",
  "Eléctrico y Encendido",
]);

export const availabilitySchema = z.enum([
  "En stock inmediato",
  "Envío hoy",
  "Bajo pedido",
]);

export const productSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  oemCode: z.string().min(1),
  category: categorySchema,
  brands: z.array(z.string().min(1)).min(1),
  compatibility: z.string().min(1),
  availability: availabilitySchema,
  image: z.string().min(1),
  priceRef: z.string().min(1).optional(),
  warranty: z.string().min(1),
  specs: z.array(productSpecSchema).min(1),
  description: z.string().optional(),
  inStock: z.boolean().optional(),
});

export const cartLineSchema = z.object({
  id: z.string().min(1),
  qty: z.number().int().min(1).max(99),
});

export type Category = z.infer<typeof categorySchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type ProductSpec = z.infer<typeof productSpecSchema>;
export type Product = z.infer<typeof productSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;

export interface CartItem {
  product: Product;
  quantity: number;
}
