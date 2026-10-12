import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { BrandsSection } from "@/components/BrandsSection";
import { Catalog } from "@/components/Catalog";
import { TrustBadges } from "@/components/TrustBadges";
import { WorkshopLocation } from "@/components/WorkshopLocation";
import { Benefits } from "@/components/Benefits";
import { Proceso } from "@/components/Proceso";
import { Testimonios } from "@/components/Testimonios";
import { FAQ } from "@/components/FAQ";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { MotionProvider } from "@/components/MotionProvider";
import { QuoteProvider } from "@/context/QuoteContext";

// Modales: cero valor SEO, solo interacción → fuera del bundle inicial y sin SSR.
const QuoteDrawer = dynamic(
  () => import("@/components/QuoteDrawer").then((m) => m.QuoteDrawer),
  { ssr: false }
);
const ProductQuickView = dynamic(
  () => import("@/components/ProductQuickView").then((m) => m.ProductQuickView),
  { ssr: false }
);
// Contador below-fold sin valor SEO → code-split con placeholder anti-saloto.
const Metricas = dynamic(
  () => import("@/components/Metricas").then((m) => m.Metricas),
  {
    loading: () => (
      <div className="border-y border-slate-100 bg-white py-20" aria-hidden="true">
        <div className="mx-auto max-w-7xl animate-pulse px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mx-auto h-12 w-32 rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <QuoteProvider>
      <MotionProvider>
        <Navbar />
        <main>
          <Hero />
          <TrustBar />
          <FeaturedCategories />
          <BrandsSection />
          {/* Suspense requerido por useSearchParams en Catalog */}
          <Suspense>
            <Catalog />
          </Suspense>
          <TrustBadges />
          <div id="taller">
            <WorkshopLocation />
          </div>
          <Benefits />
          <Metricas />
          <Proceso />
          <Testimonios />
          <FAQ />
          <CtaBanner />
        </main>
        <Footer />
        <WhatsAppFloat />
        <QuoteDrawer />
        <ProductQuickView />
      </MotionProvider>
    </QuoteProvider>
  );
}
