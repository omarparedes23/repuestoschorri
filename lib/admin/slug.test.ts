import { describe, expect, it } from "vitest";
import { nextAvailableSlug, slugify } from "@/lib/admin/slug";

describe("slugify", () => {
  it("quita acentos y ñ, y reemplaza símbolos por guiones", () => {
    expect(slugify("Pastillas de Freno Ñandú 2.0")).toBe("pastillas-de-freno-nandu-2-0");
  });

  it("colapsa separadores y recorta guiones en los extremos", () => {
    expect(slugify("  --Amortiguador   delantero!!  ")).toBe("amortiguador-delantero");
  });

  it("devuelve cadena vacía si no hay letras ni números (sin fallback)", () => {
    expect(slugify("¡¡¡")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  it("trunca a 60 caracteres sin dejar guion final", () => {
    const largo = `${"a".repeat(59)} bbbbbb`;
    const slug = slugify(largo);
    expect(slug).toBe("a".repeat(59));
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slugify("x".repeat(80))).toBe("x".repeat(60));
  });
});

describe("nextAvailableSlug", () => {
  it("devuelve la base si está libre", () => {
    expect(nextAvailableSlug("amortiguador-delantero", new Set(["otro"]))).toBe("amortiguador-delantero");
  });

  it("añade -2 si la base está ocupada", () => {
    expect(nextAvailableSlug("amortiguador-delantero", new Set(["amortiguador-delantero"]))).toBe(
      "amortiguador-delantero-2",
    );
  });

  it("continúa con -3 si -2 también está ocupado", () => {
    const taken = new Set(["amortiguador-delantero", "amortiguador-delantero-2"]);
    expect(nextAvailableSlug("amortiguador-delantero", taken)).toBe("amortiguador-delantero-3");
  });

  it("reutiliza un hueco: -2 libre aunque -3 exista", () => {
    const taken = new Set(["freno", "freno-3"]);
    expect(nextAvailableSlug("freno", taken)).toBe("freno-2");
  });

  it("el conjunto ocupado mezcla ids y slugs: basta que uno coincida", () => {
    // Un producto con id "freno" pero slug distinto también bloquea la base.
    expect(nextAvailableSlug("freno", new Set(["freno"]))).toBe("freno-2");
  });

  it("el sufijo se aplica tras truncar y el total no pasa de 60", () => {
    const base = "a".repeat(60);
    const result = nextAvailableSlug(base, new Set([base]));
    expect(result).toBe(`${"a".repeat(58)}-2`);
    expect(result.length).toBe(60);
  });
});
