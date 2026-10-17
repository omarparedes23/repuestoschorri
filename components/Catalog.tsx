"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
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
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function Catalog({ catalog }: { catalog: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => parseCatalogParams(searchParams).query);
  const [category, setCategory] = useState<CatalogFilters["category"]>(
    () => parseCatalogParams(searchParams).category
  );
  const [brand, setBrand] = useState(() => parseCatalogParams(searchParams).brand);
  const [availability, setAvailability] = useState<CatalogFilters["availability"]>(
    () => parseCatalogParams(searchParams).availability
  );
  const [sortBy, setSortBy] = useState<SortOption>("featured");
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

  // Conteo de productos por categoría (considerando búsqueda, marca y disponibilidad activas)
  const categoryCounts = useMemo(() => {
    const q = normalize(query.trim());
    const counts: Record<string, number> = { [ALL_CATEGORIES]: 0 };
    for (const c of CATEGORIES) counts[c] = 0;

    for (const p of catalog) {
      if (brand && brand !== ALL_BRANDS && !p.brands.includes(brand)) continue;
      if (availability !== ALL_AVAILABILITY && p.availability !== availability) continue;
      if (q) {
        const haystack = normalize(
          `${p.name} ${p.code} ${p.oemCode} ${p.compatibility} ${p.brands.join(" ")} ${p.category} ${p.description || ""}`
        );
        if (!haystack.includes(q)) continue;
      }
      counts[ALL_CATEGORIES] = (counts[ALL_CATEGORIES] ?? 0) + 1;
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [catalog, query, brand, availability]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const base = catalog.filter((p) => {
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

    if (sortBy === "featured") return base;

    return [...base].sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name, "es");
      }
      if (sortBy === "price-asc") {
        const pa = a.price ?? Number.POSITIVE_INFINITY;
        const pb = b.price ?? Number.POSITIVE_INFINITY;
        return pa - pb;
      }
      if (sortBy === "price-desc") {
        const pa = a.price ?? Number.NEGATIVE_INFINITY;
        const pb = b.price ?? Number.NEGATIVE_INFINITY;
        return pb - pa;
      }
      return 0;
    });
  }, [catalog, query, category, brand, availability, sortBy]);

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
    setSortBy("featured");
    setPage(1);
    router.replace("/#catalogo", { scroll: false });
  };

  const hasActiveFilters = Boolean(
    query.trim() ||
      (brand && brand !== ALL_BRANDS) ||
      category !== ALL_CATEGORIES ||
      availability !== ALL_AVAILABILITY
  );

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

        {/* Panel de Filtros y Búsqueda */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
            {/* 1. Input de Búsqueda rápida con botón limpiar */}
            <div className="sm:col-span-2 lg:col-span-4 relative">
              <label htmlFor="catalog-search" className="sr-only">
                Buscar en el catálogo
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="text"
                value={query}
                onChange={(e) => applyFilter({ query: e.target.value })}
                placeholder="Buscar por nombre, código OEM (ej: 48190), modelo…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-9 text-xs font-medium text-ink placeholder:text-slate-400 transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/25"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => applyFilter({ query: "" })}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* 2. Selector de Marca */}
            <div className="lg:col-span-3 relative">
              <select
                aria-label="Filtrar por marca"
                value={brand}
                onChange={(e) => applyFilter({ brand: e.target.value })}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 pl-3.5 pr-10 text-xs font-semibold text-slate-700 transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/25"
              >
                <option value="">{ALL_BRANDS}</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>

            {/* 3. Selector de Disponibilidad */}
            <div className="lg:col-span-3 relative">
              <select
                aria-label="Filtrar por disponibilidad"
                value={availability}
                onChange={(e) =>
                  applyFilter({ availability: e.target.value as CatalogFilters["availability"] })
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 pl-3.5 pr-10 text-xs font-semibold text-slate-700 transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/25"
              >
                <option value={ALL_AVAILABILITY}>{ALL_AVAILABILITY}</option>
                <option value="En stock inmediato">En stock inmediato</option>
                <option value="Envío hoy">Envío hoy</option>
                <option value="Bajo pedido">Bajo pedido</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>

            {/* 4. Selector de Ordenamiento */}
            <div className="sm:col-span-2 lg:col-span-2 relative">
              <ArrowUpDown
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <select
                aria-label="Ordenar repuestos"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 pl-8 pr-8 text-xs font-semibold text-slate-700 transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/25"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A-Z</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Categorías Tabs con conteo en vivo y scroll horizontal limpio */}
          <div
            role="group"
            aria-label="Filtrar por categoría"
            className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 px-5 pt-4 pb-1 sm:-mx-6 sm:px-6"
          >
            {tabs.map((c) => {
              const isSelected = category === c;
              const count = categoryCounts[c] ?? 0;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => applyFilter({ category: c as CatalogFilters["category"] })}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-navy text-white shadow-sm shadow-navy/20"
                      : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-navy"
                  }`}
                >
                  <span>{c}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de estado de resultados y filtros activos */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              Mostrando <strong className="text-navy">{paged.length}</strong> de{" "}
              <strong className="text-navy">{filtered.length}</strong> repuestos
              {totalPages > 1 && (
                <>
                  {" "}· página <strong className="text-navy">{safePage}</strong> de {totalPages}
                </>
              )}
            </span>
          </div>

          {/* Chips de filtros activos + botón Limpiar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {query.trim() && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                  Búsqueda: &ldquo;{query.trim()}&rdquo;
                  <button
                    type="button"
                    aria-label="Quitar filtro de búsqueda"
                    onClick={() => applyFilter({ query: "" })}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {brand && brand !== ALL_BRANDS && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  Marca: {brand}
                  <button
                    type="button"
                    aria-label="Quitar filtro de marca"
                    onClick={() => applyFilter({ brand: "" })}
                    className="rounded-full p-0.5 hover:text-brand-strong"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {category !== ALL_CATEGORIES && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
                  Categoría: {category}
                  <button
                    type="button"
                    aria-label="Quitar filtro de categoría"
                    onClick={() => applyFilter({ category: ALL_CATEGORIES })}
                    className="rounded-full p-0.5 hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {availability !== ALL_AVAILABILITY && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Estado: {availability}
                  <button
                    type="button"
                    aria-label="Quitar filtro de disponibilidad"
                    onClick={() => applyFilter({ availability: ALL_AVAILABILITY })}
                    className="rounded-full p-0.5 hover:text-emerald-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-navy"
              >
                <RotateCcw className="h-3 w-3" />
                Limpiar filtros
              </button>
            </div>
          )}
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
              <nav
                aria-label="Paginación del catálogo"
                className="mt-10 flex items-center justify-center gap-3"
              >
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
                  Página <strong className="text-navy">{safePage}</strong> de {totalPages}
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
            <h3 className="mt-4 font-heading text-lg font-bold text-navy">
              No encontramos ese repuesto con los filtros actuales
            </h3>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
              Disponemos de más de 5,000 ítems en almacén central que no están en la muestra web. Escríbenos con el número de chasis (VIN) o muestra y te lo cotizamos de inmediato.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
              <a
                href={whatsappLink(`${GENERIC_MESSAGE} Busco un repuesto que no encontré en el catálogo.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
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
