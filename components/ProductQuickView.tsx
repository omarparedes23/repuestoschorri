"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ShieldCheck,
  Car,
  Wrench,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Minus,
  FileText,
} from "lucide-react";
import { useQuote } from "@/context/QuoteContext";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { productWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/price";

export function ProductQuickView() {
  const { quickViewProduct, setQuickViewProduct, addItem, items, setIsOpen } = useQuote();
  const [copiedCode, setCopiedCode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const product = quickViewProduct;

  if (product && product.id !== activeProductId) {
    setActiveProductId(product.id);
    setQuantity(1);
    setCopiedCode(false);
  } else if (!product && activeProductId !== null) {
    setActiveProductId(null);
  }

  useEffect(() => {
    if (!product) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuickViewProduct(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, setQuickViewProduct]);

  const cartItem = product ? items.find((i) => i.product.id === product.id) : undefined;
  const isInCart = Boolean(cartItem);
  const priceLabel = product
    ? formatPrice(product.price, product.currency, product.priceNote)
    : null;

  const handleCopyCode = () => {
    if (!product) return;
    navigator.clipboard.writeText(`${product.code} / ${product.oemCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AnimatePresence>
      {product ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quickview-title"
        >
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
            key={product.id}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            {/* Sticky Close Header for Mobile & Desktop */}
            <div className="sticky top-0 z-20 flex justify-end p-3 sm:p-4 pointer-events-none">
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-600 shadow-md backdrop-blur-md transition-colors hover:bg-navy hover:text-white"
                aria-label="Cerrar ficha técnica"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="-mt-16 grid md:grid-cols-2">
              {/* Image Column */}
              <div className="flex flex-col justify-between border-b border-slate-100 bg-gradient-to-b from-white to-slate-50 p-6 sm:p-8 md:border-b-0 md:border-r">
                <div className="relative aspect-square w-full min-h-[260px] overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50 shadow-2xs">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-contain p-6"
                    />
                  ) : (
                    <ProductPlaceholder
                      category={product.category}
                      oemCode={product.oemCode}
                      code={product.code}
                      size="lg"
                    />
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs shadow-2xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {product.availability}
                  </span>
                  {priceLabel ? (
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Precio referencial
                      </span>
                      <span className="font-heading text-base font-extrabold text-navy">
                        {priceLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="font-heading text-xs font-bold text-slate-600">
                      Precio a cotizar
                    </span>
                  )}
                </div>
              </div>

              {/* Details Column */}
              <div className="flex flex-col p-6 sm:p-8 pt-6 md:pt-10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    {product.category}
                  </span>
                  <h2
                    id="quickview-title"
                    className="mt-1 font-heading text-xl font-black leading-tight text-navy sm:text-2xl"
                  >
                    {product.name}
                  </h2>

                  {/* Codes & Copy */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                      Cód: {product.code}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700">
                      OEM: {product.oemCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand"
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
                <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy">
                    <Car className="h-4 w-4 text-brand" />
                    Vehículos Compatibles
                  </h4>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800">
                    {product.compatibility}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {product.brands.map((b) => (
                      <span
                        key={b}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-2xs"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specs Table */}
                <div className="mt-5">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy">
                    <Wrench className="h-4 w-4 text-brand" />
                    Ficha Técnica & Especificaciones
                  </h4>
                  <dl className="mt-2.5 divide-y divide-slate-100 text-xs">
                    {product.specs.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-4 py-2">
                        <dt className="font-medium text-slate-500">{s.label}</dt>
                        <dd className="text-right font-semibold text-slate-800">{s.value}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 py-2">
                      <dt className="font-medium text-slate-500">Garantía oficial</dt>
                      <dd className="flex items-center gap-1 font-semibold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" /> {product.warranty}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* CTA Footer with Quantity Selector */}
                <div className="mt-auto pt-6">
                  <div className="border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Selector de cantidad */}
                      <div className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="inline-flex h-10 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-navy"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2.25rem] text-center font-mono text-sm font-bold text-navy">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                          className="inline-flex h-10 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white hover:text-navy"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Botón Agregar al Cotizador */}
                      <button
                        type="button"
                        onClick={() => addItem(product, quantity)}
                        className={`flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all active:scale-[0.98] ${
                          isInCart
                            ? "border-brand bg-brand/10 text-brand hover:bg-brand/15"
                            : "border-navy bg-navy text-white hover:bg-brand hover:border-brand"
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="h-4 w-4 stroke-[2.5]" />
                            <span>Agregar más ({cartItem?.quantity} en lista)</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                            <span>Agregar al Cotizador</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Botón WhatsApp directo + enlace a ver lista */}
                    <div className="mt-3 flex flex-col gap-2.5">
                      <a
                        href={whatsappLink(productWhatsappMessage(product))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-[0.98]"
                      >
                        <WhatsAppIcon className="h-5 w-5" />
                        Consultar directo por WhatsApp
                      </a>

                      {isInCart && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuickViewProduct(null);
                            setIsOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 py-1 text-xs font-bold text-brand hover:text-brand-strong hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Ver lista de cotización ({cartItem?.quantity}{" "}
                          {cartItem?.quantity === 1 ? "unidad" : "unidades"})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
