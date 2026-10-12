"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Tooltip interactivo con estado en línea */}
      {showTooltip && (
        <div className="relative mb-1 hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-2.5 text-xs shadow-xl backdrop-blur-md animate-bounce duration-1000">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div className="leading-tight">
            <p className="font-bold text-ink">¿Buscas una pieza específica?</p>
            <p className="text-[11px] text-slate-500">Asesores técnicos en línea</p>
          </div>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="ml-1 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
            aria-label="Cerrar aviso"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Botón flotante pulsante */}
      <a
        href={whatsappLink(GENERIC_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp a asesoría técnica"
        className="group relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 transition-all duration-300 hover:scale-110 hover:bg-emerald-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-500/40 motion-reduce:hidden"
        />
        <WhatsAppIcon className="h-8 w-8 transition-transform group-hover:scale-110" />

        {/* Badge online en el icono */}
        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
      </a>
    </div>
  );
}
