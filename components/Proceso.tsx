import { pasos } from "@/data/content";
import { BUSINESS } from "@/lib/config";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function Proceso() {
  return (
    <section className="relative overflow-hidden bg-surface py-24">
      <div className="absolute bottom-0 left-1/3 -z-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Paso a paso"
          title={
            <>
              ¿Cómo <Highlight>comprar</Highlight> repuestos?
            </>
          }
          subtitle="Un proceso simple y transparente, de la consulta a la entrega."
        />

        <Reveal>
        <ol
          className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-9 hidden h-0.5 bg-gradient-to-r from-navy/20 via-accent/40 to-navy/20 lg:block"
          />
          {pasos.map((p) => (
            <li key={p.numero} className="relative text-center">
              <span className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-accent bg-white font-heading text-2xl font-extrabold text-navy shadow-lg">
                {p.numero}
              </span>
              <h3 className="mb-2 font-heading text-lg font-bold text-navy">{p.titulo}</h3>
              <p className="px-2 text-sm font-light leading-relaxed text-slate-600">
                {p.descripcion}
              </p>
            </li>
          ))}
        </ol>
        </Reveal>

        <Reveal className="mt-14 text-center" delay={0.1}>
          <a
            href={whatsappLink(GENERIC_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-bold text-white shadow-[0_0_18px_rgba(220,38,38,0.35)] transition-all hover:-translate-y-1 hover:bg-accent-strong"
          >
            <WhatsAppIcon /> Empezar ahora por WhatsApp
          </a>
          <p className="mt-4 text-sm font-light text-slate-600">
            Te respondemos en horario comercial — {BUSINESS.hours[0].days}{" "}
            {BUSINESS.hours[0].time}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
