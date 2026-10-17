"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

const BASE =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "border border-slate-300 bg-white text-navy hover:bg-slate-50",
} as const;

// Botón de envío que lee el estado del <form> padre (useFormStatus).
export function SubmitButton({
  children,
  pendingText = "Procesando...",
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
