import { describe, expect, it } from "vitest";
import { parseStored } from "@/context/QuoteContext";

describe("parseStored (carrito en localStorage)", () => {
  it("null, basura y no-arreglos devuelven lista vacía", () => {
    expect(parseStored(null)).toEqual([]);
    expect(parseStored("basura{{")).toEqual([]);
    expect(parseStored("{}")).toEqual([]);
  });

  it("el formato legacy v1 ({product, quantity}) se descarta sin romper", () => {
    expect(
      parseStored(JSON.stringify([{ product: { id: "p1" }, quantity: 2 }]))
    ).toEqual([]);
  });

  it("acepta líneas válidas {id, qty}", () => {
    expect(parseStored(JSON.stringify([{ id: "p1", qty: 2 }]))).toEqual([
      { id: "p1", qty: 2 },
    ]);
  });

  it("descarta cantidades fuera de rango e ids vacíos", () => {
    expect(
      parseStored(
        JSON.stringify([
          { id: "p1", qty: 0 },
          { id: "p1", qty: 100 },
          { id: "", qty: 1 },
        ])
      )
    ).toEqual([]);
  });

  it("deduplica por id quedándose con la primera línea", () => {
    expect(
      parseStored(
        JSON.stringify([
          { id: "p1", qty: 1 },
          { id: "p1", qty: 5 },
        ])
      )
    ).toEqual([{ id: "p1", qty: 1 }]);
  });
});
