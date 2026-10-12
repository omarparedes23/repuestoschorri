import { Quote, Star } from "lucide-react";
import { testimonios } from "@/data/content";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function Testimonios() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <Quote
        aria-hidden="true"
        className="absolute right-10 top-10 h-64 w-64 text-accent/5"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Testimonios"
          title={
            <>
              Lo que dicen <Highlight>nuestros clientes</Highlight>
            </>
          }
          subtitle="La confianza de conductores, talleres y transportistas es nuestro mejor respaldo."
        />

        <Reveal>
        <ul
          className="grid gap-8 md:grid-cols-3"
        >
          {testimonios.map((t) => (
            <li
              key={t.nombre}
              className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <Quote className="mb-4 h-8 w-8 text-accent" aria-hidden="true" />
              <div className="mb-4 flex gap-0.5" role="img" aria-label={`${t.estrellas} de 5 estrellas`}>
                {Array.from({ length: t.estrellas }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mb-6 font-light italic leading-relaxed text-slate-600">
                &ldquo;{t.texto}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-brand font-bold text-white">
                  {t.nombre.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy">{t.nombre}</p>
                  <p className="text-xs font-light text-slate-500">{t.rol}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        </Reveal>
      </div>
    </section>
  );
}
