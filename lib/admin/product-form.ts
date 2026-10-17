import { z } from "zod";
import { availabilitySchema, type Availability } from "@/lib/product-schema";
import { slugify } from "@/lib/admin/slug";

export const MAX_SPECS = 12;

const SPEC_INCOMPLETE = "Completa la etiqueta y el valor, o deja la fila vacía";

// Obligatorio con trim: "   " cuenta como vacío.
function required(message: string, max = 200) {
  return z
    .string({ error: message })
    .trim()
    .min(1, { error: message })
    .max(max, { error: `Máximo ${max} caracteres` });
}

function optionalText(max: number) {
  return z.string({ error: "Texto no válido" }).trim().max(max, { error: `Máximo ${max} caracteres` });
}

const rawSpecSchema = z.object({
  label: z.string({ error: SPEC_INCOMPLETE }).trim().max(60, { error: "Máximo 60 caracteres" }),
  value: z.string({ error: SPEC_INCOMPLETE }).trim().max(200, { error: "Máximo 200 caracteres" }),
});

const specsSchema = z
  .array(rawSpecSchema)
  .superRefine((rows, ctx) => {
    let complete = 0;
    rows.forEach((row, index) => {
      const hasLabel = row.label.length > 0;
      const hasValue = row.value.length > 0;
      if (hasLabel && hasValue) complete++;
      else if (hasLabel !== hasValue) {
        ctx.addIssue({ code: "custom", message: SPEC_INCOMPLETE, path: [index] });
      }
    });
    if (complete > MAX_SPECS) {
      ctx.addIssue({ code: "custom", message: `Máximo ${MAX_SPECS} especificaciones` });
    }
  })
  .transform((rows) => rows.filter((row) => row.label.length > 0 && row.value.length > 0));

const availabilityField = z.custom<Availability>((v) => availabilitySchema.safeParse(v).success, {
  error: "Elige una disponibilidad válida",
});

const brandIdsSchema = z
  .array(z.string({ error: "Marca no válida" }).trim())
  .transform((ids) => [...new Set(ids.filter((id) => id.length > 0))]);

// Hasta 8 enteros y 2 decimales (numeric(10,2)); la coma se acepta como separador.
const PRICE_PATTERN = /^\d{1,8}([.]\d{1,2})?$/;
const PRICE_ERROR = "Ingresa un precio válido (0 o más, hasta 2 decimales)";

const precioSchema = z
  .string({ error: PRICE_ERROR })
  .trim()
  .refine((v) => v === "" || PRICE_PATTERN.test(v.replace(",", ".")), { error: PRICE_ERROR })
  .transform((v) => (v === "" ? null : Number(v.replace(",", "."))));

/**
 * Entrada cruda del formulario (todo texto, como llega del navegador) -> producto
 * validado. `precio` llega como string y sale como número o null.
 */
export const productFormSchema = z.object({
  nombre: required("El nombre es obligatorio", 120).refine((v) => slugify(v) !== "", {
    error: "El nombre debe incluir letras o números",
  }),
  codigo: required("El código es obligatorio", 60),
  // oem/compatibilidad/garantía: el esquema público (productSchema) exige min(1);
  // si quedaran vacíos la web descartaría el producto en silencio.
  oem: required("El código OEM es obligatorio", 60),
  categoriaId: required("Elige una categoría", 60),
  marcaIds: brandIdsSchema,
  compatibilidad: required("La compatibilidad es obligatoria", 300),
  disponibilidad: availabilityField,
  garantia: required("La garantía es obligatoria", 100),
  descripcion: optionalText(2000),
  precio: precioSchema,
  precioNota: optionalText(60),
  activo: z.boolean({ error: "Estado no válido" }),
  especificaciones: specsSchema,
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

// ---------------------------------------------------------------------------
// FormData <-> valores de formulario <-> payload de la RPC (todo PURO)
// ---------------------------------------------------------------------------

/** Valores tal como los muestra el formulario (texto), para repoblar o editar. */
export interface ProductFormValues {
  nombre: string;
  codigo: string;
  oem: string;
  categoriaId: string;
  marcaIds: string[];
  compatibilidad: string;
  disponibilidad: string;
  garantia: string;
  descripcion: string;
  precio: string;
  precioNota: string;
  activo: boolean;
  especificaciones: { label: string; value: string }[];
}

export type ParseProductResult =
  | { success: true; data: ProductFormInput }
  | { success: false; fieldErrors: Record<string, string>; values: ProductFormValues };

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function textList(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((v): v is string => typeof v === "string");
}

/**
 * Lee del FormData solo los campos conocidos: `id`, `slug` e `imagen` del cliente
 * se ignoran (R17). Las filas de especificaciones llegan como `specLabel[]` y
 * `specValue[]` pareados por posición.
 */
export function readFormValues(formData: FormData): ProductFormValues {
  const labels = textList(formData, "specLabel");
  const specValues = textList(formData, "specValue");
  const rows = Math.max(labels.length, specValues.length);

  return {
    nombre: text(formData, "nombre"),
    codigo: text(formData, "codigo"),
    oem: text(formData, "oem"),
    categoriaId: text(formData, "categoriaId"),
    marcaIds: textList(formData, "marcaIds"),
    compatibilidad: text(formData, "compatibilidad"),
    disponibilidad: text(formData, "disponibilidad"),
    garantia: text(formData, "garantia"),
    descripcion: text(formData, "descripcion"),
    precio: text(formData, "precio"),
    precioNota: text(formData, "precioNota"),
    activo: formData.get("activo") === "on",
    especificaciones: Array.from({ length: rows }, (_, i) => ({
      label: labels[i] ?? "",
      value: specValues[i] ?? "",
    })),
  };
}

/** Valida el FormData del navegador (nunca se confía en él) con Zod. */
export function parseProductFormData(formData: FormData): ParseProductResult {
  const values = readFormValues(formData);
  const parsed = productFormSchema.safeParse(values);
  if (parsed.success) return { success: true, data: parsed.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return { success: false, fieldErrors, values };
}

/** Qué escribe la RPC: alta (id/slug nuevos) o edición (solo el id objetivo). */
export type SaveTarget =
  | { crear: true; id: string; slug: string }
  | { crear: false; id: string; imagenActual: string | null };

export interface RpcProducto {
  id: string;
  slug?: string;
  nombre: string;
  codigo: string;
  oem: string;
  categoria_id: string;
  compatibilidad: string;
  disponibilidad: string;
  imagen: string | null;
  precio: number | null;
  moneda?: string;
  precio_nota: string | null;
  garantia: string;
  especificaciones: { label: string; value: string }[];
  descripcion: string | null;
  activo: boolean;
}

export interface RpcPayload {
  producto: RpcProducto;
  marcas: string[];
}

/**
 * Arma los argumentos de `chorri_guardar_producto`. Vacíos => null (la RPC aplica
 * `::numeric` al precio: una cadena vacía fallaría). En edición NO se envía slug
 * ni moneda (inmutables). Imagen (R17): alta => null; edición => la actual de BD.
 */
export function formToRpcPayload(input: ProductFormInput, target: SaveTarget): RpcPayload {
  const base = {
    id: target.id,
    nombre: input.nombre,
    codigo: input.codigo,
    oem: input.oem,
    categoria_id: input.categoriaId,
    compatibilidad: input.compatibilidad,
    disponibilidad: input.disponibilidad,
    precio: input.precio,
    precio_nota: input.precioNota || null,
    garantia: input.garantia,
    especificaciones: input.especificaciones,
    descripcion: input.descripcion || null,
    activo: input.activo,
  };
  const producto: RpcProducto = target.crear
    ? { ...base, slug: target.slug, moneda: "PEN", imagen: null }
    : { ...base, imagen: target.imagenActual };
  return { producto, marcas: input.marcaIds };
}

/** Fila cruda de chorri_productos + ids de marca, como la devuelve queries.ts. */
export interface AdminProductRow {
  id: string;
  slug: string | null;
  nombre: string;
  codigo: string;
  oem: string;
  categoria_id: string;
  compatibilidad: string;
  disponibilidad: string;
  imagen: string | null;
  precio: number | string | null;
  moneda: string;
  precio_nota: string | null;
  garantia: string;
  especificaciones: unknown;
  descripcion: string | null;
  activo: boolean;
  marcas: { marca_id: string }[];
}

function specsFromRow(value: unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  const out: { label: string; value: string }[] = [];
  for (const item of value) {
    if (item && typeof item === "object") {
      const { label, value: v } = item as Record<string, unknown>;
      if (typeof label === "string" && typeof v === "string") out.push({ label, value: v });
    }
  }
  return out;
}

/** Fila de BD -> valores del formulario de edición. */
export function rowToFormValues(row: AdminProductRow): ProductFormValues {
  return {
    nombre: row.nombre,
    codigo: row.codigo,
    oem: row.oem,
    categoriaId: row.categoria_id,
    marcaIds: row.marcas.map((m) => m.marca_id),
    compatibilidad: row.compatibilidad,
    disponibilidad: row.disponibilidad,
    garantia: row.garantia,
    descripcion: row.descripcion ?? "",
    precio: row.precio === null ? "" : String(Number(row.precio)),
    precioNota: row.precio_nota ?? "",
    activo: row.activo,
    especificaciones: specsFromRow(row.especificaciones),
  };
}
