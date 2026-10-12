import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/data/products";
import {
  GENERIC_MESSAGE,
  cartWhatsappMessage,
  productWhatsappMessage,
  whatsappLink,
} from "@/lib/whatsapp";
import { WHATSAPP_NUMBER } from "@/lib/config";

describe("whatsappLink", () => {
  it("apunta a wa.me con el número configurado y el mensaje codificado", () => {
    const url = whatsappLink("Hola, ¿tienen stock?");
    expect(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
    expect(url).toContain(encodeURIComponent("Hola, ¿tienen stock?"));
  });
});

describe("productWhatsappMessage", () => {
  it("incluye nombre, códigos, categoría y compatibilidad", () => {
    const p = PRODUCTS[0];
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
      { product: PRODUCTS[0], quantity: 2 },
      { product: PRODUCTS[1], quantity: 1 },
    ]);
    expect(msg).toContain(`1. *${PRODUCTS[0].name}* (Cant: 2)`);
    expect(msg).toContain(`2. *${PRODUCTS[1].name}* (Cant: 1)`);
    expect(msg).toContain(PRODUCTS[0].code);
    expect(msg).toContain(PRODUCTS[1].oemCode);
  });
});
