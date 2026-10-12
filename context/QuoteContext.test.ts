import { describe, expect, it } from "vitest";
import { getCatalogSync } from "@/lib/products";
import { parseStored } from "@/context/QuoteContext";

describe("parseStored (carrito en localStorage)", () => {
  it("null, basura y no-arreglos devuelven lista vacía", () => {
    expect(parseStored(null)).toEqual([]);
    expect(parseStored("basura{{")).toEqual([]);
    expect(parseStored("{}")).toEqual([]);
  });

  it("el formato legacy v1 ({product, quantity}) se descarta sin romper", () => {
    const legacy = JSON.stringify([
      { product: getCatalogSync()[0], quantity: 2 },
    ]);
    expect(parseStored(legacy)).toEqual([]);
  });

  it("acepta líneas válidas con ids del catálogo", () => {
    const id = getCatalogSync()[0].id;
    expect(parseStored(JSON.stringify([{ id, qty: 2 }]))).toEqual([
      { id, qty: 2 },
    ]);
  });

  it("descarta ids desconocidos y cantidades fuera de rango", () => {
    const id = getCatalogSync()[0].id;
    expect(
      parseStored(
        JSON.stringify([
          { id: "zzz-desconocido", qty: 1 },
          { id, qty: 0 },
          { id, qty: 100 },
        ])
      )
    ).toEqual([]);
  });

  it("deduplica por id quedándose con la primera línea", () => {
    const id = getCatalogSync()[0].id;
    expect(
      parseStored(
        JSON.stringify([
          { id, qty: 1 },
          { id, qty: 5 },
        ])
      )
    ).toEqual([{ id, qty: 1 }]);
  });
});
