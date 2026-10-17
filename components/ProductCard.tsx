"use client";

import Image from "next/image";
import { Eye, Plus, Check, ShieldCheck, Car } from "lucide-react";
import type { Product } from "@/types/product";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { productWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/price";
import { useQuote } from "@/context/QuoteContext";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, setQuickViewProduct } = useQuote();
  const inQuote = items.some((i) => i.product.id === product.id);
  const formattedPrice = formatPrice(product.price, product.currency);

  const getStatusBadge = () => {
    switch (product.availability) {
      case "En stock inmediato":
        return {
          pill: "bg-white/95 text-emerald-700 border-emerald-200/90 shadow-sm",
          dot: "bg-emerald-500",
        };
      case "Envío hoy":
        return {
          pill: "bg-white/95 text-sky-700 border-sky-200/90 shadow-sm",
          dot: "bg-sky-500",
        };
      case "Bajo pedido":
      default:
        return {
          pill: "bg-white/95 text-amber-700 border-amber-200/90 shadow-sm",
          dot: "bg-amber-500",
        };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-slate-900/5">
      {/* Header imagen tipo estudio automotriz (sin recortes) */}
      <div
        onClick={() => setQuickViewProduct(product)}
        className="relative aspect-[4/3] cursor-pointer overflow-hidden border-b border-slate-100 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/80"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder
            category={product.category}
            oemCode={product.oemCode}
            code={product.code}
            size="md"
          />
        )}

        {/* Barra superior sobre imagen: Estado + Ficha técnica */}
        <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md ${statusStyle.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {product.availability}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-navy shadow-sm backdrop-blur-md transition-all hover:border-navy hover:bg-navy hover:text-white"
            title="Ver ficha técnica y especificaciones"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ficha</span>
          </button>
        </div>
      </div>

      {/* Cuerpo de la tarjeta con alineación uniforme */}
      <div className="flex flex-1 flex-col p-5">
        {/* Categoría + Código OEM */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate font-bold uppercase tracking-wider text-brand">
            {product.category}
          </span>
          <span className="shrink-0 rounded-md border border-slate-200/80 bg-slate-100/90 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
            OEM: {product.oemCode}
          </span>
        </div>

        {/* Título con altura fija de 2 líneas */}
        <h3
          onClick={() => setQuickViewProduct(product)}
          className="mt-2 min-h-[2.75rem] cursor-pointer font-heading text-base font-bold leading-snug text-navy transition-colors group-hover:text-brand line-clamp-2"
        >
          {product.name}
        </h3>

        {/* Subtítulo: Código de catálogo + chips de marca */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">
            Cód: <strong className="font-mono font-semibold text-slate-700">{product.code}</strong>
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {product.brands.slice(0, 3).map((brand) => (
              <span
                key={brand}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Compatibilidad con altura uniforme */}
        <div className="mt-3 flex min-h-[3.25rem] items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/90 p-2.5 text-xs text-slate-600">
          <Car className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          <span className="line-clamp-2 leading-relaxed">{product.compatibility}</span>
        </div>

        {/* Bloque inferior: Precio + Garantía + Acciones */}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-2 border-t border-slate-100 pt-3.5">
            <div>
              {formattedPrice ? (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Precio ref.
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-lg font-extrabold tracking-tight text-navy">
                      {formattedPrice}
                    </span>
                    {product.priceNote && (
                      <span className="text-[11px] font-medium text-slate-500">
                        {product.priceNote}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cotización B2B / Taller
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    Precio a cotizar
                  </span>
                </div>
              )}
            </div>

            <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{product.warranty}</span>
            </div>
          </div>

          {/* Fila de botones de acción */}
          <div className="mt-3.5 flex items-center gap-2">
            <a
              href={whatsappLink(productWhatsappMessage(product))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              <span>Cotizar</span>
            </a>

            <button
              type="button"
              onClick={() => addItem(product, 1)}
              aria-label={inQuote ? "Agregado al cotizador" : "Agregar a lista de cotización"}
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition-all active:scale-[0.98] ${
                inQuote
                  ? "border-brand/30 bg-brand/10 text-brand"
                  : "border-slate-200 bg-slate-50 text-navy hover:border-navy hover:bg-navy hover:text-white"
              }`}
              title={inQuote ? "Ya está en tu lista de cotización" : "Añadir a lista de cotización"}
            >
              {inQuote ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>En lista</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Cotizador</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
