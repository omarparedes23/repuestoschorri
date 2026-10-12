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
                className="group relative block cursor-pointer overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-2xl"
              >
                <div className="relative mb-5 h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-navy backdrop-blur-md shadow-md">
                    {cat.count}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-xl font-black text-ink transition-colors group-hover:text-brand">
                    {cat.title}
                  </h3>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all group-hover:bg-brand group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {cat.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand">
                  <span>Ver repuestos disponibles</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
