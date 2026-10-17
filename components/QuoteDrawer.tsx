"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, FileText } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { cartWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/price";

export function QuoteDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, totalCount } = useQuote();

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  const { estimatedSubtotal, hasPricedItems, hasUnpricedItems } = useMemo(() => {
    let sum = 0;
    let priced = false;
    let unpriced = false;

    for (const { product, quantity } of items) {
      if (product.price !== null && Number.isFinite(product.price)) {
        sum += product.price * quantity;
        priced = true;
      } else {
        unpriced = true;
      }
    }

    return {
      estimatedSubtotal: sum,
      hasPricedItems: priced,
      hasUnpricedItems: unpriced,
    };
  }, [items]);

  const handleExploreCatalog = () => {
    setIsOpen(false);
    setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="flex w-screen max-w-md flex-col bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Lista de cotización"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-navy">
                      Lista de Cotización
                    </h2>
                    <p className="text-xs text-slate-500">
                      {totalCount}{" "}
                      {totalCount === 1
                        ? "repuesto seleccionado"
                        : "repuestos seleccionados"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                  aria-label="Cerrar lista"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-bold text-navy">
                      Tu lista está vacía
                    </h3>
                    <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
                      Navega por el catálogo y agrega los repuestos que necesita tu vehículo o taller para cotizarlos todos juntos en un solo mensaje.
                    </p>
                    <button
                      type="button"
                      onClick={handleExploreCatalog}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-strong"
                    >
                      Explorar repuestos <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {items.map(({ product, quantity }) => {
                      const priceLabel = formatPrice(
                        product.price,
                        product.currency,
                        product.priceNote
                      );
                      return (
                        <li key={product.id} className="flex items-start gap-3.5 py-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="64px"
                                className="object-contain p-1.5 bg-white"
                              />
                            ) : (
                              <ProductPlaceholder
                                category={product.category}
                                oemCode={product.oemCode}
                                code={product.code}
                                size="sm"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-1 text-xs font-bold text-navy">
                              {product.name}
                            </h4>
                            <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                              Cód: {product.code} · OEM: {product.oemCode}
                            </p>
                            {priceLabel ? (
                              <p className="mt-0.5 text-[11px] font-bold text-brand">
                                Ref: {priceLabel}
                              </p>
                            ) : (
                              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                Precio a cotizar
                              </p>
                            )}

                            <div className="mt-2.5 flex items-center justify-between">
                              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, quantity - 1)}
                                  className="rounded-l-lg px-2 py-1 text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-navy"
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2.5 font-mono text-xs font-bold text-navy">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, quantity + 1)}
                                  className="rounded-r-lg px-2 py-1 text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-navy"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(product.id)}
                                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Eliminar de la lista"
                                aria-label={`Eliminar ${product.name} de la lista`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer with Subtotal & WhatsApp CTA */}
              {items.length > 0 && (
                <div className="border-t border-slate-200/80 bg-slate-50 p-6">
                  <div className="mb-4 space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Total de repuestos en lista:</span>
                      <span className="font-mono text-xs font-bold text-navy">
                        {totalCount} {totalCount === 1 ? "unidad" : "unidades"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-t border-slate-100 pt-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Subtotal referencial estimado:
                      </span>
                      {hasPricedItems ? (
                        <div className="text-right">
                          <span className="font-heading text-base font-extrabold text-navy">
                            S/ {estimatedSubtotal.toFixed(2)}
                          </span>
                          {hasUnpricedItems && (
                            <span className="block text-[10px] font-medium text-slate-400">
                              + ítems sujetos a cotización
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-brand">
                          A cotizar por asesor
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={whatsappLink(cartWhatsappMessage(items))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Enviar Cotización por WhatsApp
                  </a>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500">
                      Respuesta promedio: &lt; 5 minutos
                    </p>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] font-semibold text-slate-400 transition-colors hover:text-red-600"
                    >
                      Vaciar lista
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
