import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_CATEGORIES } from "@/data/products";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";
import { buildCatalogQuery } from "@/lib/catalog-filters";

export function FeaturedCategories() {
  return (
    <section className="bg-surface py-20 border-b border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Especialidades"
          title={
            <>
              Líneas de repuestos <Highlight>destacadas</Highlight>
            </>
          }
          subtitle="Encuentra piezas certificadas con ajuste exacto de fábrica para todas las marcas y modelos."
        />

        <Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={buildCatalogQuery({ category: cat.id })}
                aria-label={`Ver repuestos de ${cat.title}`}
                className="group relative flex flex-col cursor-pointer overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-brand before:to-accent before:opacity-0 before:transition-opacity hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-navy/5 hover:before:opacity-100"
              >
                <div
                  className={`relative mb-5 h-48 w-full overflow-hidden rounded-2xl border border-slate-200/50 ${
                    cat.fit === "contain"
                      ? "bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1]"
                      : "bg-slate-900"
                  }`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={`transition-transform duration-700 ease-out group-hover:scale-105 ${
                      cat.fit === "contain" ? "object-contain p-4" : "object-cover"
                    }`}
                  />
                  {cat.fit === "contain" ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-navy/25 to-transparent" />
                  ) : (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/20 to-transparent" />
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-navy/90 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm backdrop-blur-md">
                    {cat.count}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-xl font-black text-ink transition-colors group-hover:text-brand">
                    {cat.title}
                  </h3>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <p className="mt-2.5 text-sm font-normal leading-relaxed text-slate-600">
                  {cat.description}
                </p>

                <div className="mt-auto flex items-center gap-2 pt-5 text-xs font-bold uppercase tracking-wider text-brand">
                  <span>Ver repuestos disponibles</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
