"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Search, ShieldCheck, Zap, Truck } from "lucide-react";
import { BRANDS } from "@/data/brands";
import { CATEGORIES } from "@/data/products";
import type { Category } from "@/types/product";
import { buildCatalogQuery } from "@/lib/catalog-filters";
import { fadeInUp, staggerContainer } from "./shared/animations";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";

export function Hero() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      buildCatalogQuery({
        brand: brand || undefined,
        category: (category || undefined) as Category | undefined,
        query: query.trim() || undefined,
      })
    );
    // El href ya lleva #catalogo; este scroll es el fallback inmediato.
    requestAnimationFrame(() => {
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  return (
    <section
      id="inicio"
      className="relative flex min-h-[88vh] items-center overflow-hidden bg-navy text-white"
    >
      {/* Background and Ambient Effects */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="relative h-full w-full"
        >
          <Image
            src="/hero.jpg"
            alt="Taller y repuestos automotrices de alta gama"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[75%_center] lg:object-right"
          />
        </motion.div>
        {/* Velo uniforme solo en móvil (el texto ocupa todo el ancho) */}
        <div className="absolute inset-0 bg-navy/75 lg:hidden" />
        {/* Degradado solo sobre la columna de texto; la imagen queda visible a la derecha */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-navy from-0% via-navy/90 via-45% to-transparent to-75% lg:block" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-36 sm:px-6 sm:pb-36 sm:pt-40 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl"
        >
          {/* Badge de confianza */}
          <motion.div
            variants={fadeInUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-sky-300 backdrop-blur-md"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Stock Inmediato & Especialistas en Pernos de Alineación
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-heading text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="sr-only">RB Repuestos Chorry: </span>
            La pieza exacta para tu auto o taller,{" "}
            <span className="text-accent">con garantía real y entrega inmediata.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-5 max-w-2xl text-base font-normal leading-relaxed text-slate-200 sm:text-lg"
          >
            Repuestos multimarca y soluciones de suspensión para Lima y provincias.
          </motion.p>

          {/* Buscador Avanzado Vehicular */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSearch}
            className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            <div className="grid gap-3.5 sm:grid-cols-12">
              {/* Selector Marca */}
              <div className="sm:col-span-4">
                <label
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sky-200"
                  htmlFor="hero-brand"
                >
                  1. Marca
                </label>
                <div className="relative">
                  <select
                    id="hero-brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-white/20 bg-white/95 pl-3.5 pr-10 text-xs font-semibold text-ink shadow-sm transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="">Todas las marcas (Toyota, Nissan...)</option>
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              {/* Selector Categoría */}
              <div className="sm:col-span-4">
                <label
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sky-200"
                  htmlFor="hero-category"
                >
                  2. Sistema / Categoría
                </label>
                <div className="relative">
                  <select
                    id="hero-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-white/20 bg-white/95 pl-3.5 pr-10 text-xs font-semibold text-ink shadow-sm transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <option value="">Cualquier categoría</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              {/* Búsqueda por texto / código */}
              <div className="sm:col-span-4">
                <label
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sky-200"
                  htmlFor="hero-query"
                >
                  3. Repuesto o Código OEM
                </label>
                <div className="relative">
                  <input
                    id="hero-query"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: pastillas, 48190, hilux…"
                    className="h-11 w-full rounded-xl border border-white/20 bg-white/95 px-3.5 text-xs font-medium text-ink shadow-sm placeholder:text-slate-400 transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-4 sm:flex-row">
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-200 sm:justify-start">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Repuestos garantizados
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="h-4 w-4 text-sky-300" /> Despacho mismo día
                </span>
              </div>

              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-7 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand/30 transition-all hover:bg-blue-600 active:scale-[0.98] sm:w-auto"
              >
                <Search className="h-4 w-4" /> Buscar Repuestos
              </button>
            </div>
          </motion.form>

          {/* Botones de acción directa */}
          <motion.div
            variants={fadeInUp}
            className="mt-6 flex flex-col items-stretch gap-3 sm:mt-7 sm:flex-row sm:items-center sm:gap-4"
          >
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              Explorar Catálogo <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappLink(GENERIC_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
            >
              <WhatsAppIcon className="h-4 w-4 text-emerald-400" /> Consultar a un Mecánico Asesor
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
