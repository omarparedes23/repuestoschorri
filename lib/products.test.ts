import { describe, expect, it } from "vitest";
import {
  VALID_PRODUCT_IDS,
  getCatalogSync,
  getProductById,
  getProducts,
} from "@/lib/products";

describe("repositorio de productos", () => {
  it("expone un catálogo no vacío con ids únicos y válidos", async () => {
    const catalog = getCatalogSync();
    expect(catalog.length).toBeGreaterThan(0);
    const ids = catalog.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(VALID_PRODUCT_IDS.has(id)).toBe(true);
  });

  it("getProducts (firma async lista para Supabase) devuelve lo mismo", async () => {
    await expect(getProducts()).resolves.toHaveLength(getCatalogSync().length);
  });

  it("getProductById encuentra y devuelve null con id desconocido", async () => {
    const first = getCatalogSync()[0];
    await expect(getProductById(first.id)).resolves.toMatchObject({
      id: first.id,
    });
    await expect(getProductById("no-existe")).resolves.toBeNull();
  });
});
