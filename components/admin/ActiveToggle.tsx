"use client";

import { useState, useTransition } from "react";
import { setProductActive } from "@/lib/admin/actions";

const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

// Activar/desactivar con confirmación en dos pasos. No existe borrado en ninguna capa.
export function ActiveToggle({ id, name, active }: { id: string; name: string; active: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await setProductActive(id, !active);
      if (!result.ok) setError(result.message ?? "No se pudo cambiar el estado.");
      setConfirming(false);
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Confirmar cambio de ${name}`}>
        <span className="text-sm text-slate-700">
          {active ? "¿Ocultar de la web?" : "¿Mostrar en la web?"}
        </span>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className={`${BUTTON} border-brand bg-brand text-white hover:bg-brand-strong`}
        >
          {pending ? "Guardando..." : "Sí, confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className={`${BUTTON} border-slate-300 bg-white text-navy hover:bg-slate-50`}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        aria-pressed={active}
        aria-label={`${name}: visible en la web`}
        onClick={() => setConfirming(true)}
        className={`${BUTTON} border-slate-300 bg-white text-navy hover:bg-slate-50`}
      >
        {active ? "Ocultar" : "Mostrar"}
      </button>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
