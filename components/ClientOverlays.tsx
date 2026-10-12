"use client";

import dynamic from "next/dynamic";

// Modales: cero valor SEO, solo interacción → fuera del bundle inicial y sin SSR.
// `ssr: false` NO está permitido en Server Components, por eso estos dos viven
// en este componente cliente (el `page.tsx` es Server Component).
const QuoteDrawer = dynamic(
  () => import("@/components/QuoteDrawer").then((m) => m.QuoteDrawer),
  { ssr: false }
);
const ProductQuickView = dynamic(
  () => import("@/components/ProductQuickView").then((m) => m.ProductQuickView),
  { ssr: false }
);

export function ClientOverlays() {
  return (
    <>
      <QuoteDrawer />
      <ProductQuickView />
    </>
  );
}
