import { describe, expect, it } from "vitest";
import { productFormSchema } from "@/lib/admin/product-form";

function valid(overrides: Record<string, unknown> = {}) {
  return {
    nombre: "Amortiguador delantero",
    codigo: "PE-1450",
    oem: "48190-02050",
    categoriaId: "suspension",
    marcaIds: ["toyota", "nissan"],
    compatibilidad: "Toyota Hilux 2005-2015",
    disponibilidad: "En stock inmediato",
    garantia: "6 meses",
    descripcion: "",
    precio: "",
    precioNota: "",
    activo: true,
    especificaciones: [],
    ...overrides,
  };
}

function errorsOf(input: unknown): Record<string, string> {
  const result = productFormSchema.safeParse(input);
  if (result.success) return {};
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

describe("productFormSchema: obligatorios y textos", () => {
  it("acepta un producto válido y recorta los textos", () => {
    const result = productFormSchema.safeParse(
      valid({ nombre: "  Amortiguador delantero  ", codigo: " PE-1450 ", garantia: " 6 meses " }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nombre).toBe("Amortiguador delantero");
      expect(result.data.codigo).toBe("PE-1450");
      expect(result.data.garantia).toBe("6 meses");
      expect(result.data.marcaIds).toEqual(["toyota", "nissan"]);
      expect(result.data.precio).toBeNull();
    }
  });

  it("nombre solo con espacios falla con 'El nombre es obligatorio'", () => {
    expect(errorsOf(valid({ nombre: "   " })).nombre).toBe("El nombre es obligatorio");
  });

  it("nombre sin letras ni números falla con mensaje específico (R12)", () => {
    expect(errorsOf(valid({ nombre: "¡¡¡" })).nombre).toBe("El nombre debe incluir letras o números");
  });

  it("código y categoría vacíos fallan con mensajes en español", () => {
    const errors = errorsOf(valid({ codigo: "", categoriaId: "" }));
    expect(errors.codigo).toBe("El código es obligatorio");
    expect(errors.categoriaId).toBe("Elige una categoría");
  });

  it("OEM, compatibilidad y garantía son obligatorios (si no, la web descarta el producto)", () => {
    const errors = errorsOf(valid({ oem: " ", compatibilidad: "", garantia: "" }));
    expect(errors.oem).toBe("El código OEM es obligatorio");
    expect(errors.compatibilidad).toBe("La compatibilidad es obligatoria");
    expect(errors.garantia).toBe("La garantía es obligatoria");
  });

  it("disponibilidad fuera del enum falla en español", () => {
    expect(errorsOf(valid({ disponibilidad: "Quizá" })).disponibilidad).toBe("Elige una disponibilidad válida");
  });

  it("acepta las tres disponibilidades", () => {
    for (const disponibilidad of ["En stock inmediato", "Envío hoy", "Bajo pedido"]) {
      expect(productFormSchema.safeParse(valid({ disponibilidad })).success).toBe(true);
    }
  });

  it("descarta marcas repetidas o vacías", () => {
    const result = productFormSchema.safeParse(valid({ marcaIds: ["toyota", "toyota", " ", "nissan"] }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.marcaIds).toEqual(["toyota", "nissan"]);
  });
});

describe("productFormSchema: especificaciones", () => {
  it("descarta la fila totalmente vacía y recorta las demás", () => {
    const result = productFormSchema.safeParse(
      valid({
        especificaciones: [
          { label: " Material ", value: " Acero " },
          { label: "  ", value: "" },
        ],
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.especificaciones).toEqual([{ label: "Material", value: "Acero" }]);
  });

  it("fila con solo etiqueta (o solo valor) falla en esa fila", () => {
    const errors = errorsOf(
      valid({
        especificaciones: [
          { label: "Material", value: "Acero" },
          { label: "Peso", value: "" },
        ],
      }),
    );
    expect(errors["especificaciones.1"]).toBe("Completa la etiqueta y el valor, o deja la fila vacía");
    expect(errors["especificaciones.0"]).toBeUndefined();
    expect(errorsOf(valid({ especificaciones: [{ label: "", value: "x" }] }))["especificaciones.0"]).toBe(
      "Completa la etiqueta y el valor, o deja la fila vacía",
    );
  });

  it("máximo 12 filas completas", () => {
    const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `E${i}`, value: `V${i}` }));
    expect(productFormSchema.safeParse(valid({ especificaciones: rows(12) })).success).toBe(true);
    expect(errorsOf(valid({ especificaciones: rows(13) })).especificaciones).toBe(
      "Máximo 12 especificaciones",
    );
  });
});

describe("productFormSchema: precio (R16)", () => {
  function precioOf(precio: string) {
    const result = productFormSchema.safeParse(valid({ precio }));
    return result.success ? result.data.precio : errorsOf(valid({ precio })).precio;
  }

  it("vacío o solo espacios => null y es válido", () => {
    expect(precioOf("")).toBeNull();
    expect(precioOf("   ")).toBeNull();
  });

  it("acepta punto y coma decimal (teclado móvil)", () => {
    expect(precioOf("12,50")).toBe(12.5);
    expect(precioOf("12.5")).toBe(12.5);
    expect(precioOf("0")).toBe(0);
    expect(precioOf("150")).toBe(150);
  });

  it("negativo, texto y formatos raros fallan con mensaje en español", () => {
    const message = "Ingresa un precio válido (0 o más, hasta 2 decimales)";
    expect(precioOf("-5")).toBe(message);
    expect(precioOf("abc")).toBe(message);
    expect(precioOf("1,2,3")).toBe(message);
  });

  it("más de 2 decimales falla", () => {
    expect(precioOf("12.345")).toBe("Ingresa un precio válido (0 o más, hasta 2 decimales)");
  });

  it("más de 8 dígitos enteros falla (numeric(10,2))", () => {
    expect(precioOf("123456789")).toBe("Ingresa un precio válido (0 o más, hasta 2 decimales)");
    expect(precioOf("99999999.99")).toBe(99999999.99);
  });
});
