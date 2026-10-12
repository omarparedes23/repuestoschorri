"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, FileText, Package } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { cartWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/price";

export function QuoteDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, totalCount } = useQuote();

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
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
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
                    <h2 className="font-heading text-lg font-bold text-ink">
                      Lista de Cotización
                    </h2>
                    <p className="text-xs text-slate-500">
                      {totalCount} {totalCount === 1 ? "repuesto seleccionado" : "repuestos seleccionados"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
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
                    <h3 className="mt-4 font-heading text-base font-bold text-ink">
                      Tu lista está vacía
                    </h3>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">
                      Navega por el catálogo y agrega los repuestos que necesita tu vehículo o taller para cotizarlos todos juntos en un solo mensaje.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                    >
                      Explorar repuestos <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {items.map(({ product, quantity }) => {
                      const priceLabel = formatPrice(product.price, product.currency, product.priceNote);
                      return (
                      <li key={product.id} className="py-4 flex gap-4 items-start">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <Package className="h-6 w-6" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-ink line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Cód: {product.code} · OEM: {product.oemCode}
                          </p>
                          {priceLabel && (
                            <p className="text-[11px] font-semibold text-brand mt-0.5">
                              Ref: {priceLabel}
                            </p>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="px-2 py-1 text-slate-600 hover:text-ink hover:bg-slate-200/60 rounded-l-lg transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-slate-800">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="px-2 py-1 text-slate-600 hover:text-ink hover:bg-slate-200/60 rounded-r-lg transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(product.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
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

              {/* Footer with WhatsApp CTA */}
              {items.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50 p-6">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>Total de repuestos en lista:</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">
                      {totalCount} unidades
                    </span>
                  </div>

                  <a
                    href={whatsappLink(cartWhatsappMessage(items))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-[0.98]"
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
                      className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
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
