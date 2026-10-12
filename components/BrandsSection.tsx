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
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {BRANDS.map((brand) => (
              <li key={brand}>
                <a
                  href={buildCatalogQuery({ brand })}
                  aria-label={`Ver repuestos ${brand}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-surface px-3 py-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-navy/10"
                >
                  <span className="relative h-14 w-14 rounded-xl border border-slate-100 bg-white p-2 shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src={BRAND_LOGOS[brand]}
                      alt={`Logo ${brand}`}
                      fill
                      sizes="56px"
                      className="object-contain p-2"
                    />
                  </span>
                  <span className="text-center text-sm font-bold text-navy">{brand}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
