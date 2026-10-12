"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, Car, Wrench, CheckCircle2, Copy, Check } from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { productWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { useState } from "react";

export function ProductQuickView() {
  const { quickViewProduct, setQuickViewProduct, addItem, items } = useQuote();
  const [copiedCode, setCopiedCode] = useState(false);

  const product = quickViewProduct;
  const isInCart = product ? items.some((i) => i.product.id === product.id) : false;

  const handleCopyCode = () => {
    if (!product) return;
    navigator.clipboard.writeText(`${product.code} / ${product.oemCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AnimatePresence>
      {product ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickViewProduct(null)}
          className="absolute inset-0 bg-navy/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setQuickViewProduct(null)}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Image Column */}
            <div className="relative aspect-square md:aspect-auto bg-slate-100 p-6 flex flex-col justify-between">
              <div className="relative h-full min-h-[300px] w-full overflow-hidden rounded-2xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {product.availability}
                </span>
                {product.priceRef && (
                  <span className="font-heading font-black text-slate-900 text-sm">
                    Precio ref: {product.priceRef}
                  </span>
                )}
              </div>
            </div>

            {/* Details Column */}
            <div className="p-6 sm:p-8 flex flex-col">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  {product.category}
                </span>
                <h2 className="mt-1 font-heading text-2xl font-black text-ink sm:text-3xl leading-tight">
                  {product.name}
                </h2>

                {/* Codes & Copy */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-slate-700">
                    Cód: {product.code}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-mono font-semibold text-blue-700 border border-blue-200">
                    OEM: {product.oemCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copiar códigos
                      </>
                    )}
                  </button>
                </div>

                {product.description && (
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Compatibility Box */}
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Car className="h-4 w-4 text-brand" />
                  Vehículos Compatibles
                </h4>
                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  {product.compatibility}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.brands.map((b) => (
                    <span
                      key={b}
                      className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm border border-slate-200"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specs Table */}
              <div className="mt-6">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Wrench className="h-4 w-4 text-brand" />
                  Ficha Técnica & Especificaciones
                </h4>
                <dl className="mt-2.5 divide-y divide-slate-100 text-xs">
                  {product.specs.map((s, idx) => (
                    <div key={idx} className="flex justify-between py-2">
                      <dt className="text-slate-500 font-medium">{s.label}</dt>
                      <dd className="font-semibold text-slate-800 text-right">{s.value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between py-2">
                    <dt className="text-slate-500 font-medium">Garantía oficial</dt>
                    <dd className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> {product.warranty}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* CTA buttons */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappLink(productWhatsappMessage(product))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Consultar por WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => {
                    addItem(product, 1);
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-all border ${
                    isInCart
                      ? "bg-brand/10 border-brand text-brand"
                      : "bg-navy text-white hover:bg-blue-900 border-navy"
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" /> En tu Cotizador
                    </>
                  ) : (
                    "Agregar al Cotizador"
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      ) : null}
    </AnimatePresence>
  );
}
