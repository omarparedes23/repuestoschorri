import { WHATSAPP_NUMBER } from "./config";
import type { CartItem, Product } from "@/types/product";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const GENERIC_MESSAGE =
  "Hola RB Repuestos Chorry, quisiera cotizar repuestos para mi vehículo. ¿Me pueden asesorar?";

export function productWhatsappMessage(product: Product): string {
  return `¡Hola RB Repuestos Chorry! 👋
Quisiera consultar disponibilidad y precio para el siguiente repuesto:

🔩 *${product.name}*
🏷️ *Código:* ${product.code} (OEM: ${product.oemCode})
📂 *Categoría:* ${product.category}
🚗 *Compatibilidad:* ${product.compatibility}
📦 *Estado:* ${product.availability}

¿Tienen stock inmediato y cuál sería el costo de envío o punto de recojo?`;
}

export function cartWhatsappMessage(items: CartItem[]): string {
  if (items.length === 0) return GENERIC_MESSAGE;

  const itemList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}* (Cant: ${item.quantity})\n   - Cód: ${item.product.code} | OEM: ${item.product.oemCode}\n   - Aplica a: ${item.product.compatibility}`
    )
    .join("\n\n");

  return `¡Hola RB Repuestos Chorry! 🚗🔧
Quisiera solicitar una cotización formal para la siguiente lista de repuestos:

${itemList}

Por favor, confirmen disponibilidad total, precios con descuento de taller/pack y formas de entrega o envío. ¡Muchas gracias!`;
}
