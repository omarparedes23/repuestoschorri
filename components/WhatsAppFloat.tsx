"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { useQuote } from "@/context/QuoteContext";

export function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(true);
  const { totalCount, setIsOpen } = useQuote();

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      {/* Botón rápido de Cotizador cuando hay ítems en lista */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Abrir lista de cotización con ${totalCount} repuestos`}
          className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-navy px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-navy/25 transition-all hover:-translate-y-0.5 hover:bg-brand active:scale-95"
        >
          <FileText className="h-4 w-4 text-sky-400" />
          <span>Mi Cotización</span>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 font-mono text-[11px] font-extrabold text-white">
            {totalCount}
          </span>
        </button>
      )}

      <div className="flex items-center gap-3">
        {/* Tooltip discreto en escritorio */}
        {showTooltip && (
          <div className="hidden sm:flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-xs shadow-lg shadow-slate-900/5 backdrop-blur-md">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <div className="leading-tight">
              <p className="font-bold text-navy">¿Buscas una pieza por VIN o muestra?</p>
              <p className="text-[11px] text-slate-500">Asesores técnicos en línea</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="ml-1 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar aviso"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Botón principal de WhatsApp limpio y profesional */}
        <a
          href={whatsappLink(GENERIC_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp a asesoría técnica"
          className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
        >
          <WhatsAppIcon className="h-7 w-7 transition-transform duration-200 group-hover:scale-105" />
          <span
            aria-hidden="true"
            className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400"
          />
        </a>
      </div>
    </div>
  );
}
