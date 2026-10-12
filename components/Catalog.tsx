"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch, Search, X } from "lucide-react";
import { CATEGORIES } from "@/data/products";
import { BRANDS } from "@/data/brands";
import { ProductCard } from "./ProductCard";
import { Highlight, SectionHeader } from "./SectionHeader";
import {
  ALL_BRANDS,
  ALL_CATEGORIES,
  ALL_AVAILABILITY,
  PAGE_SIZE,
  buildCatalogQuery,
  parseCatalogParams,
  parsePage,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import { getCatalogSync } from "@/lib/products";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function Catalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Fuente validada (hoy estática, mañana Supabase vía lib/products.ts).
  const catalog = useMemo(() => getCatalogSync(), []);

  const [query, setQuery] = useState(() => parseCatalogParams(searchParams).query);
  const [category, setCategory] = useState<CatalogFilters["category"]>(
    () => parseCatalogParams(searchParams).category
  );
  const [brand, setBrand] = useState(() => parseCatalogParams(searchParams).brand);
  const [availability, setAvailability] = useState<CatalogFilters["availability"]>(
    () => parseCatalogParams(searchParams).availability
  );
  const [page, setPage] = useState(() => parsePage(searchParams));

  // Sincroniza el estado cuando la URL cambia desde fuera (Hero, categorías,
  // marcas). Ajuste durante el render — patrón recomendado frente a setState
  // en un efecto (sin renders en cascada).
  const paramsKey = searchParams.toString();
  const [syncedKey, setSyncedKey] = useState(paramsKey);
  if (syncedKey !== paramsKey) {
    setSyncedKey(paramsKey);
    const next = parseCatalogParams(searchParams);
    setQuery(next.query);
    setCategory(next.category);
    setBrand(next.brand);
    setAvailability(next.availability);
    setPage(parsePage(searchParams));
  }

  function syncUrl(next: Partial<CatalogFilters> & { query?: string; page?: number }) {
    router.replace(
      buildCatalogQuery({
        brand,
        category,
        query,
        availability,
        page,
        ...next,
      }),
      { scroll: false }
    );
  }

  /** Cambiar un filtro siempre vuelve a la página 1. */
  function applyFilter(next: Partial<CatalogFilters> & { query?: string }) {
    if (next.query !== undefined) setQuery(next.query);
    if (next.category !== undefined) setCategory(next.category);
    if (next.brand !== undefined) setBrand(next.brand);
    if (next.availability !== undefined) setAvailability(next.availability);
    setPage(1);
    syncUrl({ ...next, page: 1 });
  }

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return catalog.filter((p) => {
      if (category !== ALL_CATEGORIES && p.category !== category) return false;
      if (brand && brand !== ALL_BRANDS && !p.brands.includes(brand)) return false;
      if (availability !== ALL_AVAILABILITY && p.availability !== availability)
        return false;
      if (!q) return true;
      const haystack = normalize(
        `${p.name} ${p.code} ${p.oemCode} ${p.compatibility} ${p.brands.join(" ")} ${p.category} ${p.description || ""}`
      );
      return haystack.includes(q);
    });
  }, [catalog, query, category, brand, availability]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goPage(next: number) {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    setPage(clamped);
    syncUrl({ page: clamped });
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  }

  const tabs = [ALL_CATEGORIES, ...CATEGORIES];

  const resetFilters = () => {
    setQuery("");
    setCategory(ALL_CATEGORIES);
    setBrand("");
    setAvailability(ALL_AVAILABILITY);
    setPage(1);
    router.replace("/#catalogo", { scroll: false });
  };

  const hasActiveFilters =
    query || (brand && brand !== ALL_BRANDS) || category !== ALL_CATEGORIES || availability !== ALL_AVAILABILITY;

  return (
    <section id="catalogo" className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Catálogo Integral"
          title={
            <>
              Inventario de <Highlight>repuestos automotrices</Highlight>
            </>
          }
          subtitle="Encuentra piezas por código OEM, modelo o compatibilidad. Puedes consultar individualmente o armar una lista para cotizar en paquete."
          align="left"
        />

        {/* Barra de Filtros y Búsqueda */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-12 items-center">
            {/* Input de Búsqueda rápida */}
            <div className="md:col-span-5 relative">
              <label htmlFor="catalog-search" className="sr-only">
                Buscar en el catálogo
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="search"
                value={query}
                onChange={(e) => applyFilter({ query: e.target.value })}
                placeholder="Nombre, código OEM (ej: 48190), modelo…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* Selector de Marca */}
            <div className="md:col-span-3">
              <select
                aria-label="Filtrar por marca"
                value={brand}
                onChange={(e) => applyFilter({ brand: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">{ALL_BRANDS}</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Disponibilidad */}
            <div className="md:col-span-3">
              <select
                aria-label="Filtrar por disponibilidad"
                value={availability}
                onChange={(e) =>
                  applyFilter({ availability: e.target.value as CatalogFilters["availability"] })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value={ALL_AVAILABILITY}>{ALL_AVAILABILITY}</option>
                <option value="En stock inmediato">En stock inmediato</option>
                <option value="Envío hoy">Envío hoy</option>
                <option value="Bajo pedido">Bajo pedido</option>
              </select>
            </div>

            {/* Reset */}
            <div className="md:col-span-1 flex justify-end">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-ink transition-colors"
                  title="Limpiar filtros"
                  aria-label="Limpiar filtros"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Categorías Tabs con scroll horizontal estilizado */}
          <div
            role="group"
            aria-label="Filtrar por categoría"
            className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pt-3 border-t border-slate-100 pb-1 scrollbar-none"
          >
            {tabs.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => applyFilter({ category: c as CatalogFilters["category"] })}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  category === c
                    ? "bg-navy text-white shadow-md shadow-navy/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen de resultados y badges activos */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              Mostrando <strong className="text-ink">{paged.length}</strong> de {filtered.length} repuestos
              {totalPages > 1 && (
                <>
                  {" "}· página <strong className="text-ink">{safePage}</strong> de {totalPages}
                </>
              )}
            </span>
          </div>

          {/* Active filter badges */}
          <div className="flex flex-wrap items-center gap-2">
            {brand && brand !== ALL_BRANDS && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-semibold text-brand">
                Marca: {brand}
                <button
                  type="button"
                  aria-label="Quitar filtro de marca"
                  onClick={() => applyFilter({ brand: "" })}
                >
                  <X className="h-3 w-3 hover:text-brand-strong" />
                </button>
              </span>
            )}
            {category !== ALL_CATEGORIES && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 border border-navy/20 px-3 py-1 text-xs font-semibold text-navy">
                Categoría: {category}
                <button
                  type="button"
                  aria-label="Quitar filtro de categoría"
                  onClick={() => applyFilter({ category: ALL_CATEGORIES })}
                >
                  <X className="h-3 w-3 hover:text-black" />
                </button>
              </span>
            )}
            {availability !== ALL_AVAILABILITY && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700">
                Estado: {availability}
                <button
                  type="button"
                  aria-label="Quitar filtro de disponibilidad"
                  onClick={() => applyFilter({ availability: ALL_AVAILABILITY })}
                >
                  <X className="h-3 w-3 hover:text-emerald-900" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Grilla de Productos */}
        {filtered.length > 0 ? (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paged.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Paginación del catálogo" className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goPage(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Página anterior"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600" aria-live="polite">
                  Página {safePage} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Página siguiente"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <PackageSearch className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold text-ink">
              No encontramos ese repuesto con los filtros actuales
            </h3>
            <p className="mt-1.5 max-w-md text-xs text-slate-500">
              Disponemos de más de 5,000 ítems en almacén central que no están en la muestra web. Escríbenos con el número de chasis (VIN) o muestra y te lo cotizamos de inmediato.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
              <a
                href={whatsappLink(`${GENERIC_MESSAGE} Busco un repuesto que no encontré en el catálogo.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
