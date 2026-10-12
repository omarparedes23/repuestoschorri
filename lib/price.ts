const CURRENCY_SYMBOL: Record<string, string> = {
  PEN: "S/",
  USD: "$",
};

/**
 * Formatea el precio de un producto.
 * Devuelve null si no hay precio (producto "a consultar").
 * `note` es el sufijo libre (p.ej. "(par)", "(juego x4)").
 */
export function formatPrice(
  price: number | null,
  currency: string,
  note?: string
): string | null {
  if (price === null || !Number.isFinite(price)) return null;
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  const base = `${symbol} ${price.toFixed(2)}`;
  return note ? `${base} ${note}` : base;
}
