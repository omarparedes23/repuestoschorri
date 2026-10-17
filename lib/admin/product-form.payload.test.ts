import { describe, expect, it } from "vitest";
import {
  formToRpcPayload,
  parseProductFormData,
  rowToFormValues,
  productFormSchema,
  type AdminProductRow,
} from "@/lib/admin/product-form";
import { rowToProduct } from "@/lib/product-schema";

function buildForm(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) fd.append(key, v);
  }
  return fd;
}

const BASE_FIELDS = {
  nombre: "  Amortiguador delantero ",
  codigo: "PE-1450",
  oem: "48190-02050",
  categoriaId: "suspension",
  marcaIds: ["toyota", "nissan"],
  compatibilidad: "Toyota Hilux 2005-2015",
  disponibilidad: "Envío hoy",
  garantia: "6 meses",
  descripcion: "",
  precio: "12,50",
  precioNota: "(par)",
  activo: "on",
  specLabel: ["Material", "", "Peso"],
  specValue: ["Acero", "", "2 kg"],
};

describe("parseProductFormData", () => {
  it("lee marcaIds múltiples, activo como checkbox y specs por pares", () => {
    const result = parseProductFormData(buildForm(BASE_FIELDS));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nombre).toBe("Amortiguador delantero");
      expect(result.data.marcaIds).toEqual(["toyota", "nissan"]);
      expect(result.data.activo).toBe(true);
      expect(result.data.precio).toBe(12.5);
      expect(result.data.especificaciones).toEqual([
        { label: "Material", value: "Acero" },
        { label: "Peso", value: "2 kg" },
      ]);
    }
  });

  it("checkbox ausente => activo false; sin marcas => lista vacía", () => {
    const fields: Record<string, string | string[]> = { ...BASE_FIELDS };
    delete fields.activo;
    delete fields.marcaIds;
    const result = parseProductFormData(buildForm(fields));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.activo).toBe(false);
      expect(result.data.marcaIds).toEqual([]);
    }
  });

  it("ignora el campo imagen del cliente (R17) y campos desconocidos", () => {
    const result = parseProductFormData(buildForm({ ...BASE_FIELDS, imagen: "https://evil.com/x.png", id: "hack" }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect("imagen" in result.data).toBe(false);
      expect("id" in result.data).toBe(false);
    }
  });

  it("con errores devuelve fieldErrors por campo y los valores para repoblar", () => {
    const result = parseProductFormData(
      buildForm({ ...BASE_FIELDS, nombre: "   ", precio: "abc", specLabel: ["Peso"], specValue: [""] }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.nombre).toBe("El nombre es obligatorio");
      expect(result.fieldErrors.precio).toBe("Ingresa un precio válido (0 o más, hasta 2 decimales)");
      expect(result.fieldErrors["especificaciones.0"]).toBe("Completa la etiqueta y el valor, o deja la fila vacía");
      expect(result.values.precio).toBe("abc");
      expect(result.values.codigo).toBe("PE-1450");
      expect(result.values.marcaIds).toEqual(["toyota", "nissan"]);
      expect(result.values.activo).toBe(true);
    }
  });

  it("formulario vacío: todos los obligatorios fallan sin lanzar", () => {
    const result = parseProductFormData(new FormData());
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.fieldErrors)).toEqual(
        expect.arrayContaining([
          "nombre",
          "codigo",
          "oem",
          "categoriaId",
          "compatibilidad",
          "disponibilidad",
          "garantia",
        ]),
      );
    }
  });
});

function parsedInput() {
  const result = parseProductFormData(buildForm(BASE_FIELDS));
  if (!result.success) throw new Error("fixture inválido");
  return result.data;
}

const ROW: AdminProductRow = {
  id: "amortiguador-delantero",
  slug: "amortiguador-delantero",
  nombre: "Amortiguador delantero",
  codigo: "PE-1450",
  oem: "48190-02050",
  categoria_id: "suspension",
  compatibilidad: "Toyota Hilux 2005-2015",
  disponibilidad: "Bajo pedido",
  imagen: "https://x.supabase.co/storage/v1/object/public/chorri-productos/productos/a.webp",
  precio: 12.5,
  moneda: "PEN",
  precio_nota: "(par)",
  garantia: "6 meses",
  especificaciones: [{ label: "Material", value: "Acero" }],
  descripcion: "Descripción larga",
  activo: false,
  marcas: [{ marca_id: "toyota" }, { marca_id: "nissan" }],
};

describe("formToRpcPayload", () => {
  it("crear incluye id, slug y moneda; imagen null (R17); precio numérico", () => {
    const { producto, marcas } = formToRpcPayload(parsedInput(), {
      crear: true,
      id: "amortiguador-delantero",
      slug: "amortiguador-delantero",
    });
    expect(producto).toEqual({
      id: "amortiguador-delantero",
      slug: "amortiguador-delantero",
      nombre: "Amortiguador delantero",
      codigo: "PE-1450",
      oem: "48190-02050",
      categoria_id: "suspension",
      compatibilidad: "Toyota Hilux 2005-2015",
      disponibilidad: "Envío hoy",
      imagen: null,
      precio: 12.5,
      moneda: "PEN",
      precio_nota: "(par)",
      garantia: "6 meses",
      especificaciones: [
        { label: "Material", value: "Acero" },
        { label: "Peso", value: "2 kg" },
      ],
      descripcion: null,
      activo: true,
    });
    expect(marcas).toEqual(["toyota", "nissan"]);
  });

  it("editar NO incluye slug ni moneda, conserva la imagen actual y usa el id objetivo", () => {
    const { producto } = formToRpcPayload(parsedInput(), {
      crear: false,
      id: "p01",
      imagenActual: "https://x.supabase.co/storage/v1/object/public/chorri-productos/productos/a.webp",
    });
    expect(producto.id).toBe("p01");
    expect("slug" in producto).toBe(false);
    expect("moneda" in producto).toBe(false);
    expect(producto.imagen).toBe(
      "https://x.supabase.co/storage/v1/object/public/chorri-productos/productos/a.webp",
    );
  });

  it("editar sin imagen previa => null; precio vacío => null (nunca cadena vacía)", () => {
    const parsed = productFormSchema.parse({ ...rowToFormValues(ROW), precio: "" });
    const { producto } = formToRpcPayload(parsed, { crear: false, id: "p01", imagenActual: null });
    expect(producto.imagen).toBeNull();
    expect(producto.precio).toBeNull();
  });
});

describe("rowToFormValues (ida y vuelta)", () => {
  it("mapea la fila a valores de formulario (strings, marcas como ids)", () => {
    expect(rowToFormValues(ROW)).toEqual({
      nombre: "Amortiguador delantero",
      codigo: "PE-1450",
      oem: "48190-02050",
      categoriaId: "suspension",
      marcaIds: ["toyota", "nissan"],
      compatibilidad: "Toyota Hilux 2005-2015",
      disponibilidad: "Bajo pedido",
      garantia: "6 meses",
      descripcion: "Descripción larga",
      precio: "12.5",
      precioNota: "(par)",
      activo: false,
      especificaciones: [{ label: "Material", value: "Acero" }],
    });
  });

  it("precio null y textos null => cadenas vacías; especificaciones inválidas => []", () => {
    const values = rowToFormValues({
      ...ROW,
      precio: null,
      precio_nota: null,
      descripcion: null,
      especificaciones: "no-es-lista",
      marcas: [],
    });
    expect(values.precio).toBe("");
    expect(values.precioNota).toBe("");
    expect(values.descripcion).toBe("");
    expect(values.especificaciones).toEqual([]);
    expect(values.marcaIds).toEqual([]);
  });

  it("fila -> formulario -> payload de edición reproduce los campos de la fila", () => {
    const parsed = productFormSchema.parse(rowToFormValues(ROW));
    const { producto, marcas } = formToRpcPayload(parsed, { crear: false, id: ROW.id, imagenActual: ROW.imagen });
    expect(producto).toEqual({
      id: ROW.id,
      nombre: ROW.nombre,
      codigo: ROW.codigo,
      oem: ROW.oem,
      categoria_id: ROW.categoria_id,
      compatibilidad: ROW.compatibilidad,
      disponibilidad: ROW.disponibilidad,
      imagen: ROW.imagen,
      precio: ROW.precio,
      precio_nota: ROW.precio_nota,
      garantia: ROW.garantia,
      especificaciones: ROW.especificaciones,
      descripcion: ROW.descripcion,
      activo: ROW.activo,
    });
    expect(marcas).toEqual(["toyota", "nissan"]);
  });

  it("es consistente con rowToProduct: la web ve lo mismo antes y después del viaje", () => {
    const parsed = productFormSchema.parse(rowToFormValues(ROW));
    const { producto, marcas } = formToRpcPayload(parsed, { crear: false, id: ROW.id, imagenActual: ROW.imagen });
    const publicShape = (row: Record<string, unknown>, brands: string[]) =>
      rowToProduct({
        ...row,
        categoria: { nombre: "Suspensión" },
        marcas: brands.map((nombre) => ({ chorri_marcas: { nombre } })),
      });
    const before = publicShape(ROW as unknown as Record<string, unknown>, ["toyota", "nissan"]);
    const after = publicShape({ ...producto, slug: ROW.slug, moneda: ROW.moneda }, marcas);
    expect(before).not.toBeNull();
    expect(after).toEqual(before);
  });
});
