"use client";

import { useState } from "react";
import Link from "next/link";
import { ActiveToggle } from "@/components/admin/ActiveToggle";
import { filterAdminProducts } from "@/lib/admin/filter";
import type { AdminListItem } from "@/lib/admin/queries";

export function ProductList({ products }: { products: AdminListItem[] }) {
  const [query, setQuery] = useState("");
  const visible = filterAdminProducts(products, query);
  const searching = query.trim().length > 0;

  const summary = searching
    ? visible.length === 0
      ? "Sin resultados para esa búsqueda."
      : `${visible.length} de ${products.length} productos`
    : `${products.length} productos`;

  return (
    <section aria-label="Listado de productos">
      <label htmlFor="buscar" className="text-sm font-semibold text-navy">
        Buscar por nombre, código u OEM
      </label>
      <input
        id="buscar"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
        className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-ink placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
      />
      <p aria-live="polite" className="mt-2 text-sm text-slate-600">
        {summary}
      </p>

      <ul className="mt-4 space-y-3">
        {visible.map((product) => (
          <li
            key={product.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-base font-bold text-navy">{product.name}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    product.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {product.active ? "Activo" : "Oculto"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {product.code} · OEM {product.oemCode}
                {product.category ? ` · ${product.category}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/productos/${encodeURIComponent(product.id)}`}
                aria-label={`Editar ${product.name}`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Editar
              </Link>
              <ActiveToggle id={product.id} name={product.name} active={product.active} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
