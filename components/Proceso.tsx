import { pasos } from "@/data/content";
import { BUSINESS } from "@/lib/config";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function Proceso() {
  return (
    <section className="relative overflow-hidden bg-surface py-24">
      <div className="pointer-events-none absolute bottom-0 left-1/3 -z-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Paso a paso"
          title={
            <>
              ¿Cómo <Highlight>comprar</Highlight> repuestos?
            </>
          }
          subtitle="Un proceso simple, rápido y transparente, desde la consulta técnica hasta la entrega en tu taller o domicilio."
        />

        <Reveal>
          <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-12 hidden h-0.5 bg-gradient-to-r from-navy/15 via-accent/40 to-navy/15 lg:block"
            />
            {pasos.map((p, index) => (
              <li
                key={p.numero}
                className="group relative flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-navy/5 lg:p-7"
              >
                <span className="mb-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Paso {index + 1}
                </span>
                <span className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-accent bg-white font-heading text-2xl font-extrabold text-navy shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:bg-accent group-hover:text-white">
                  {p.numero}
                </span>
                <h3 className="mb-2.5 font-heading text-lg font-bold text-navy">{p.titulo}</h3>
                <p className="text-sm font-normal leading-relaxed text-slate-600">
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
            className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
          >
            <WhatsAppIcon className="h-5 w-5" /> Empezar ahora por WhatsApp
          </a>
          <p className="mt-4 text-sm font-normal text-slate-600">
            Te respondemos en horario comercial — {BUSINESS.hours[0].days}{" "}
            {BUSINESS.hours[0].time}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
