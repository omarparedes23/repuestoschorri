import Image from "next/image";
import { BRANDS, BRAND_LOGOS } from "@/data/brands";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";
import { buildCatalogQuery } from "@/lib/catalog-filters";

export function BrandsSection() {
  return (
    <section id="marcas" className="bg-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Multimarca"
          title={
            <>
              Marcas que <Highlight>atendemos</Highlight>
            </>
          }
          subtitle="Repuestos para las principales marcas de autos, camionetas y vehículos comerciales del mercado."
        />

        <Reveal>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:grid-cols-8">
            {BRANDS.map((brand) => (
              <li key={brand}>
                <a
                  href={buildCatalogQuery({ brand })}
                  aria-label={`Ver repuestos ${brand}`}
                  className="group flex h-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 bg-surface px-2.5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white hover:shadow-xl hover:shadow-navy/10 sm:gap-3 sm:px-3 sm:py-5"
                >
                  <span className="relative h-12 w-12 rounded-xl border border-slate-200/70 bg-white p-2 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-brand/20 sm:h-14 sm:w-14">
                    <Image
                      src={BRAND_LOGOS[brand]}
                      alt={`Logo ${brand}`}
                      fill
                      sizes="56px"
                      className="object-contain p-1.5 sm:p-2"
                    />
                  </span>
                  <span className="text-center text-xs font-bold tracking-tight text-navy transition-colors group-hover:text-brand sm:text-sm">
                    {brand}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
