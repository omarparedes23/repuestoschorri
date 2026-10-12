import { describe, expect, it } from "vitest";
import {
  GENERIC_MESSAGE,
  cartWhatsappMessage,
  productWhatsappMessage,
  whatsappLink,
} from "@/lib/whatsapp";
import { WHATSAPP_NUMBER } from "@/lib/config";
import type { Product } from "@/types/product";

const FIXTURES: Product[] = [
  {
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
  },
  {
    id: "p2",
    name: "Bomba de Agua",
    code: "MB-BA-003",
    oemCode: "A6512000201",
    category: "Motor",
    brands: ["Mercedes-Benz"],
    compatibility: "Mercedes-Benz Sprinter 315/415",
    availability: "Bajo pedido",
    image: null,
    price: 210,
    currency: "PEN",
    warranty: "12 meses",
    specs: [{ label: "Impulsor", value: "Acero inoxidable" }],
  },
];

describe("whatsappLink", () => {
  it("apunta a wa.me con el número configurado y el mensaje codificado", () => {
    const url = whatsappLink("Hola, ¿tienen stock?");
    expect(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
    expect(url).toContain(encodeURIComponent("Hola, ¿tienen stock?"));
  });
});

describe("productWhatsappMessage", () => {
  it("incluye nombre, códigos, categoría y compatibilidad", () => {
    const p = FIXTURES[0];
    const msg = productWhatsappMessage(p);
    expect(msg).toContain(p.name);
    expect(msg).toContain(p.code);
    expect(msg).toContain(p.oemCode);
    expect(msg).toContain(p.category);
    expect(msg).toContain(p.compatibility);
  });
});

describe("cartWhatsappMessage", () => {
  it("con lista vacía devuelve el mensaje genérico", () => {
    expect(cartWhatsappMessage([])).toBe(GENERIC_MESSAGE);
  });

  it("numera los ítems con cantidad y códigos", () => {
    const msg = cartWhatsappMessage([
      { product: FIXTURES[0], quantity: 2 },
      { product: FIXTURES[1], quantity: 1 },
    ]);
    expect(msg).toContain(`1. *${FIXTURES[0].name}* (Cant: 2)`);
    expect(msg).toContain(`2. *${FIXTURES[1].name}* (Cant: 1)`);
    expect(msg).toContain(FIXTURES[0].code);
    expect(msg).toContain(FIXTURES[1].oemCode);
  });
});
