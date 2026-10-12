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
        <p className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-white/80 sm:text-xl">
          Escríbenos o llama a nuestro taller. Un asesor te responde de inmediato con precio y
          disponibilidad.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={whatsappLink(GENERIC_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-bold text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all duration-300 hover:-translate-y-1 hover:bg-accent-strong hover:shadow-[0_0_35px_rgba(229,9,20,0.7)]"
          >
            <WhatsAppIcon /> Cotizar por WhatsApp
          </a>
          <a
            href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
          >
            <Phone className="h-5 w-5" /> {BUSINESS.phone}
          </a>
        </div>

        <p className="mt-8 text-sm font-light text-white/60">
          Atención {BUSINESS.hours[0].days} {BUSINESS.hours[0].time}
        </p>
      </Reveal>
    </section>
  );
}
