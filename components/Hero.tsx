"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, Zap, Truck } from "lucide-react";
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
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy text-white"
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
            className="object-cover object-[75%_center] lg:object-right opacity-45"
          />
        </motion.div>
        {/* Gradientes deportivos / de contraste técnico */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/60" />

        {/* Glow deportivo en acentos */}
        <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute right-10 bottom-1/4 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-36 pt-32 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl"
        >
          {/* Badge de confianza */}
          <motion.div variants={fadeInUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-sky-300 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Stock Inmediato & Especialistas en Pernos de Alineación
          </motion.div>

          <motion.h1 variants={fadeInUp}>
            <span className="block font-heading text-5xl font-black uppercase italic leading-none tracking-tight sm:text-7xl lg:text-8xl">
              RB <span className="text-white">Repuestos</span>
              <span className="block text-accent drop-shadow-[0_2px_16px_rgba(220,38,38,0.55)]">
                Chorry
              </span>
            </span>
            <span className="mt-3 block text-base font-extrabold uppercase tracking-[0.25em] text-sky-300 sm:text-lg">
              Repuestos Automotrices Multimarca & Soluciones de Suspensión
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 font-heading text-xl font-bold leading-snug sm:text-2xl text-slate-100"
          >
            La pieza exacta para tu auto o taller,{" "}
            <span className="text-sky-300 underline decoration-sky-400/60 decoration-wavy underline-offset-4">con garantía real y entrega inmediata</span>.
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="mt-3 max-w-2xl text-sm font-normal text-slate-300 sm:text-base leading-relaxed"
          >
            Especialistas en pernos excéntricos de camber, kits de suspensión, distribución de motor, frenos cerámicos y embragues para las marcas más vendidas de Lima y provincias.
          </motion.p>

          {/* Buscador Avanzado Vehicular */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSearch}
            className="mt-8 rounded-3xl border border-white/15 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4 text-ink"
          >
            <div className="grid gap-2 sm:grid-cols-12">
              {/* Selector Marca */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1" htmlFor="hero-brand">
                  1. Marca
                </label>
                <select
                  id="hero-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  <option value="">Todas las marcas (Toyota, Nissan...)</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Categoría */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1" htmlFor="hero-category">
                  2. Sistema / Categoría
                </label>
                <select
                  id="hero-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  <option value="">Cualquier categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Búsqueda por texto / código */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1" htmlFor="hero-query">
                  3. Repuesto o Código OEM
                </label>
                <div className="relative">
                  <input
                    id="hero-query"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: pastillas, 48190, hilux…"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Repuestos garantizados
                </span>
                <span className="hidden md:flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-brand" /> Despacho mismo día
                </span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-brand/30 transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                <Search className="h-4 w-4" /> Buscar Repuestos
              </button>
            </div>
          </motion.form>

          {/* Botones de acción directa */}
          <motion.div variants={fadeInUp} className="mt-8 flex flex-col gap-4 sm:flex-row items-stretch sm:items-center">
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 font-bold text-white shadow-[0_0_24px_rgba(220,38,38,0.5)] transition-all duration-300 hover:-translate-y-1 hover:bg-accent-strong hover:shadow-[0_0_36px_rgba(229,9,20,0.7)]"
            >
              Explorar Catálogo <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappLink(GENERIC_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 active:scale-[0.98]"
            >
              <WhatsAppIcon className="h-5 w-5" /> Consultar a un Mecánico Asesor
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
