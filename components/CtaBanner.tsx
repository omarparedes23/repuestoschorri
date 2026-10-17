import { Phone } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { BUSINESS } from "@/lib/config";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-navy py-24">
      <div aria-hidden="true" className="absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent/40 via-brand/30 to-accent/40 blur-[120px]" />
      </div>

      <Reveal className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 font-heading text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          ¿No encuentras tu repuesto?{" "}
          <span className="bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
            Lo conseguimos por ti
          </span>
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-base font-normal leading-relaxed text-slate-200 sm:text-xl">
          Escríbenos con el código OEM, foto de la muestra o modelo de tu vehículo. Un asesor técnico te responde de inmediato con precio y disponibilidad.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={whatsappLink(GENERIC_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500"
          >
            <WhatsAppIcon className="h-5 w-5" /> Cotizar por WhatsApp
          </a>
          <a
            href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/15"
          >
            <Phone className="h-5 w-5 text-sky-300" /> {BUSINESS.phone}
          </a>
        </div>

        <p className="mt-8 text-sm font-normal text-slate-300">
          Atención {BUSINESS.hours[0].days} {BUSINESS.hours[0].time}
        </p>
      </Reveal>
    </section>
  );
}
