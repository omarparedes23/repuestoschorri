import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/data/products";
import { cartLineSchema, productSchema } from "@/lib/product-schema";

describe("productSchema", () => {
  it("acepta un producto real del catálogo", () => {
    expect(productSchema.safeParse(PRODUCTS[0]).success).toBe(true);
  });

  it("todo el catálogo estático actual es válido", () => {
    const invalid = PRODUCTS.filter((p) => !productSchema.safeParse(p).success);
    expect(invalid).toEqual([]);
  });

  it("rechaza nombre vacío, categoría desconocida y marcas vacías", () => {
    const base = PRODUCTS[0];
    expect(
      productSchema.safeParse({ ...base, name: "" }).success
    ).toBe(false);
    expect(
      productSchema.safeParse({ ...base, category: "Bicicletas" }).success
    ).toBe(false);
    expect(productSchema.safeParse({ ...base, brands: [] }).success).toBe(
      false
    );
  });
});

describe("cartLineSchema", () => {
  it("acepta líneas dentro del rango 1–99", () => {
    expect(cartLineSchema.safeParse({ id: "p01", qty: 1 }).success).toBe(true);
    expect(cartLineSchema.safeParse({ id: "p01", qty: 99 }).success).toBe(true);
  });

  it("rechaza qty fuera de rango, no enteros y ids vacíos", () => {
    expect(cartLineSchema.safeParse({ id: "p01", qty: 0 }).success).toBe(false);
    expect(cartLineSchema.safeParse({ id: "p01", qty: 100 }).success).toBe(
      false
    );
    expect(cartLineSchema.safeParse({ id: "p01", qty: 1.5 }).success).toBe(
      false
    );
    expect(cartLineSchema.safeParse({ id: "", qty: 1 }).success).toBe(false);
  });
});
