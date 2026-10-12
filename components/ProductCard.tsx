"use client";

import Image from "next/image";
import { Eye, Plus, Check, ShieldCheck, CarFront } from "lucide-react";
import type { Product } from "@/types/product";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { productWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { useQuote } from "@/context/QuoteContext";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, setQuickViewProduct } = useQuote();
  const isInCart = items.some((i) => i.product.id === product.id);

  const getStatusBadge = () => {
    switch (product.availability) {
      case "En stock inmediato":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Envío hoy":
        return "bg-sky-500/10 text-sky-600 border-sky-500/20";
      case "Bajo pedido":
      default:
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-slate-200/60">
      {/* Header imagen con overlay interactivo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges superiores */}
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold backdrop-blur-md ${getStatusBadge()}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {product.availability}
          </span>

          {product.priceRef && (
            <span className="rounded-lg bg-navy/85 px-2.5 py-1 text-xs font-extrabold tracking-tight text-white backdrop-blur-md shadow-sm">
              Ref: {product.priceRef}
            </span>
          )}
        </div>

        {/* Botón flotante para Quick View */}
        <button
          type="button"
          onClick={() => setQuickViewProduct(product)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 opacity-90 shadow-lg backdrop-blur-sm transition-all hover:bg-brand hover:text-white group-hover:opacity-100"
          title="Ver especificaciones completas"
        >
          <Eye className="h-3.5 w-3.5" />
          Ficha técnica
        </button>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-brand">
            {product.category}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
            OEM: {product.oemCode}
          </span>
        </div>

        <h3
          onClick={() => setQuickViewProduct(product)}
          className="mt-1.5 cursor-pointer font-heading text-base font-bold leading-snug text-ink transition-colors hover:text-brand line-clamp-2"
        >
          {product.name}
        </h3>

        <p className="mt-1 text-xs text-slate-500 font-medium">
          Cód. Catálogo: <span className="font-mono text-slate-700">{product.code}</span>
        </p>

        {/* Compatibilidad resumida */}
        <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <CarFront className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="line-clamp-2">{product.compatibility}</span>
          </div>
        </div>

        {/* Garantía */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Garantía {product.warranty}</span>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          {/* Botón cotizar individual por WhatsApp */}
          <a
            href={whatsappLink(productWhatsappMessage(product))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Consultar
          </a>

          {/* Botón agregar al cotizador / carrito */}
          <button
            type="button"
            onClick={() => addItem(product, 1)}
            aria-label={isInCart ? "Agregado al cotizador" : "Agregar a lista de cotización"}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
              isInCart
                ? "border-brand bg-brand/10 text-brand"
                : "border-slate-200 bg-white text-slate-700 hover:border-brand hover:bg-brand hover:text-white"
            }`}
            title={isInCart ? "Ya está en tu cotizador" : "Añadir a lista de cotización"}
          >
            {isInCart ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
