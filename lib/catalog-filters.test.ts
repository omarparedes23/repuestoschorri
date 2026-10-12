import { describe, expect, it } from "vitest";
import {
  ALL_AVAILABILITY,
  ALL_BRANDS,
  ALL_CATEGORIES,
  buildCatalogQuery,
  parseCatalogParams,
  parsePage,
} from "@/lib/catalog-filters";

function roundtrip(filters: Parameters<typeof buildCatalogQuery>[0]) {
  const href = buildCatalogQuery(filters);
  const qs = href.split("?")[1]?.split("#")[0] ?? "";
  return parseCatalogParams(new URLSearchParams(qs));
}

describe("parseCatalogParams", () => {
  it("sin params devuelve los defaults", () => {
    const f = parseCatalogParams(new URLSearchParams(""));
    expect(f).toEqual({
      brand: "",
      category: ALL_CATEGORIES,
      query: "",
      availability: ALL_AVAILABILITY,
    });
  });

  it("recorta espacios y acepta objeto plano (SSR)", () => {
    const f = parseCatalogParams({ marca: "  Toyota ", q: "48190 " });
    expect(f.brand).toBe("Toyota");
    expect(f.query).toBe("48190");
  });
});

describe("buildCatalogQuery", () => {
  it("sin filtros apunta a /#catalogo", () => {
    expect(buildCatalogQuery({})).toBe("/#catalogo");
  });

  it("omite pagina cuando es 1 e incluye el resto", () => {
    const href = buildCatalogQuery({ brand: "Toyota", page: 1 });
    expect(href).toContain("marca=Toyota");
    expect(href).not.toContain("pagina=");
    expect(href.endsWith("#catalogo")).toBe(true);
  });

  it("incluye pagina cuando es mayor a 1", () => {
    expect(buildCatalogQuery({ page: 3 })).toContain("pagina=3");
  });

  it("roundtrip conserva marca, categoría, query y disponibilidad", () => {
    const f = roundtrip({
      brand: "Nissan",
      category: "Frenos",
      query: "48190",
      availability: "En stock inmediato",
    });
    expect(f.brand).toBe("Nissan");
    expect(f.category).toBe("Frenos");
    expect(f.query).toBe("48190");
    expect(f.availability).toBe("En stock inmediato");
  });

  it("nunca pierde el ancla (case Hero: scroll al catálogo)", () => {
    expect(buildCatalogQuery({ brand: "Toyota" })).toContain("#catalogo");
    expect(ALL_BRANDS).toBeTruthy();
  });
});

describe("parsePage", () => {
  it.each([[""], ["abc"], ["0"], ["-2"]])("(%s) cae a página 1", (raw) => {
    expect(parsePage(new URLSearchParams(`pagina=${raw}`))).toBe(1);
    expect(parsePage({ pagina: raw })).toBe(1);
  });

  it("acepta enteros positivos", () => {
    expect(parsePage(new URLSearchParams("pagina=3"))).toBe(3);
    expect(parsePage({})).toBe(1);
  });
});
