import type { ReactNode } from "react";
import type { Metadata } from "next";

// Fuera de los índices. `alternates: {}` evita heredar el canonical de la home.
export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
  alternates: {},
};

// Shell estático: NO lee la sesión (cada página lo hace bajo <Suspense>).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-surface text-ink">{children}</div>;
}
