"use client";

import { useState } from "react";
import { MAX_SPECS } from "@/lib/admin/product-form";

interface SpecRow {
  key: number;
  label: string;
  value: string;
}

const INPUT =
  "block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-ink placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-[invalid=true]:border-accent";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-navy transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

// Filas etiqueta/valor (máx. 12). Controlado: las filas con error conservan lo escrito.
// Los índices de `errors` ("especificaciones.N") son los de las filas enviadas.
export function SpecsEditor({
  initial,
  errors,
}: {
  initial: { label: string; value: string }[];
  errors: Record<string, string>;
}) {
  const [state, setState] = useState(() => ({
    rows: initial.map((row, key): SpecRow => ({ key, ...row })),
    next: initial.length,
  }));
  const { rows } = state;

  function update(key: number, field: "label" | "value", text: string) {
    setState((s) => ({ ...s, rows: s.rows.map((r) => (r.key === key ? { ...r, [field]: text } : r)) }));
  }
  function add() {
    setState((s) => ({ rows: [...s.rows, { key: s.next, label: "", value: "" }], next: s.next + 1 }));
  }
  function remove(key: number) {
    setState((s) => ({ ...s, rows: s.rows.filter((r) => r.key !== key) }));
  }

  const generalError = errors.especificaciones;

  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
      <legend className="px-1 font-heading text-base font-bold text-navy">Especificaciones</legend>
      <p className="mb-3 text-sm text-slate-600">
        Opcional. Hasta {MAX_SPECS} filas, por ejemplo Material: Acero.
      </p>

      <ul className="space-y-3">
        {rows.map((row, index) => {
          const error = errors[`especificaciones.${index}`];
          const errorId = `spec-error-${row.key}`;
          return (
            <li key={row.key}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label htmlFor={`spec-label-${row.key}`} className="text-sm font-semibold text-navy">
                    Etiqueta {index + 1}
                  </label>
                  <input
                    id={`spec-label-${row.key}`}
                    name="specLabel"
                    value={row.label}
                    onChange={(e) => update(row.key, "label", e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={`${INPUT} mt-1`}
                  />
                </div>
                <div>
                  <label htmlFor={`spec-value-${row.key}`} className="text-sm font-semibold text-navy">
                    Valor {index + 1}
                  </label>
                  <input
                    id={`spec-value-${row.key}`}
                    name="specValue"
                    value={row.value}
                    onChange={(e) => update(row.key, "value", e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={`${INPUT} mt-1`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(row.key)}
                  aria-label={`Quitar especificación ${index + 1}`}
                  className={`${BUTTON} self-end`}
                >
                  Quitar
                </button>
              </div>
              {error ? (
                <p id={errorId} className="mt-1 text-sm text-accent">
                  {error}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {generalError ? (
        <p id="spec-general-error" className="mt-2 text-sm text-accent">
          {generalError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={add}
        disabled={rows.length >= MAX_SPECS}
        className={`${BUTTON} mt-3`}
      >
        Agregar especificación
      </button>
    </fieldset>
  );
}
