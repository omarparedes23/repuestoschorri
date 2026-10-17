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
          <ul className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {testimonios.map((t) => (
              <li
                key={t.nombre}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-navy/5"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className="flex gap-0.5"
                      role="img"
                      aria-label={`${t.estrellas} de 5 estrellas`}
                    >
                      {Array.from({ length: t.estrellas }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 text-accent/40" aria-hidden="true" />
                  </div>
                  <blockquote className="mb-6 text-sm font-normal leading-relaxed text-slate-700 sm:text-base">
                    &ldquo;{t.texto}&rdquo;
                  </blockquote>
                </div>
                <div className="flex items-center gap-3.5 border-t border-slate-200/70 pt-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-brand font-bold text-white shadow-sm">
                    {t.nombre.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-navy">{t.nombre}</p>
                    <p className="text-xs font-normal text-slate-500">{t.rol}</p>
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
