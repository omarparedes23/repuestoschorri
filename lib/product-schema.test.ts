import { describe, expect, it } from "vitest";
import {
  cartLineSchema,
  productSchema,
  rowToProduct,
  type Product,
} from "@/lib/product-schema";

const DOMAIN: Product = {
  id: "p1",
  name: "Amortiguador Delantero",
  code: "MB-AM-001",
  oemCode: "A9063200230",
  category: "Suspensión",
  brands: ["Mercedes-Benz"],
  compatibility: "Mercedes-Benz Sprinter 313/413",
  availability: "En stock inmediato",
  image: null,
  price: 210,
  currency: "PEN",
  warranty: "12 meses",
  specs: [{ label: "Posición", value: "Delantero" }],
};

// Fila cruda de Supabase (columnas en español + joins de categoría y marcas).
const ROW = {
  id: "p1",
  slug: null,
  nombre: "Amortiguador Delantero",
  codigo: "MB-AM-001",
  oem: "A9063200230",
  compatibilidad: "Mercedes-Benz Sprinter 313/413",
  disponibilidad: "En stock inmediato",
  imagen: null,
  precio: "210.00",
  moneda: "PEN",
  precio_nota: null,
  garantia: "12 meses",
  especificaciones: [{ label: "Posición", value: "Delantero" }],
  descripcion: null,
  categoria: { nombre: "Suspensión" },
  marcas: [{ chorri_marcas: { nombre: "Mercedes-Benz" } }],
};

describe("productSchema", () => {
  it("acepta un producto de dominio válido", () => {
    expect(productSchema.safeParse(DOMAIN).success).toBe(true);
  });

  it("rechaza nombre/categoría vacíos y disponibilidad desconocida", () => {
    expect(productSchema.safeParse({ ...DOMAIN, name: "" }).success).toBe(false);
    expect(productSchema.safeParse({ ...DOMAIN, category: "" }).success).toBe(false);
    expect(
      productSchema.safeParse({ ...DOMAIN, availability: "Quizá" }).success
    ).toBe(false);
  });
});

describe("rowToProduct (fila Supabase → dominio)", () => {
  it("mapea una fila cruda con joins", () => {
    expect(rowToProduct(ROW)).toMatchObject({
      id: "p1",
      name: "Amortiguador Delantero",
      category: "Suspensión",
      brands: ["Mercedes-Benz"],
      price: 210,
      currency: "PEN",
      image: null,
    });
  });

  it("normaliza precio numérico, imagen y nota", () => {
    const mapped = rowToProduct({
      ...ROW,
      imagen: "https://x/y.png",
      precio: 72,
      precio_nota: "(par)",
    });
    expect(mapped).toMatchObject({
      image: "https://x/y.png",
      price: 72,
      priceNote: "(par)",
    });
  });

  it("descarta filas inválidas (null, sin categoría, nombre vacío)", () => {
    expect(rowToProduct(null)).toBeNull();
    expect(rowToProduct({ ...ROW, nombre: "" })).toBeNull();
    expect(rowToProduct({ ...ROW, categoria: null })).toBeNull();
  });
});

describe("cartLineSchema", () => {
  it("acepta líneas dentro del rango 1–99", () => {
    expect(cartLineSchema.safeParse({ id: "p01", qty: 1 }).success).toBe(true);
    expect(cartLineSchema.safeParse({ id: "p01", qty: 99 }).success).toBe(true);
  });

  it("rechaza qty fuera de rango, no enteros y ids vacíos", () => {
    expect(cartLineSchema.safeParse({ id: "p01", qty: 0 }).success).toBe(false);
    expect(cartLineSchema.safeParse({ id: "p01", qty: 100 }).success).toBe(false);
    expect(cartLineSchema.safeParse({ id: "p01", qty: 1.5 }).success).toBe(false);
    expect(cartLineSchema.safeParse({ id: "", qty: 1 }).success).toBe(false);
  });
});
