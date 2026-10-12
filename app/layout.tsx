import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { BUSINESS, SITE_URL } from "@/lib/config";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RB Repuestos Chorry | Repuestos en General - Calidad Garantizada",
    template: "%s | RB Repuestos Chorry",
  },
  description:
    "Repuestos multimarca en Chorrillos, Lima: suspensión, pernos excéntricos de camber, motor, frenos y transmisión. Asesoría técnica y envíos inmediatos. Cotiza por WhatsApp.",
  keywords: [
    "repuestos",
    "repuestos automotrices",
    "pernos excéntricos",
    "camber",
    "suspensión",
    "frenos",
    "embrague",
    "Chorrillos",
    "Lima",
    "RB Repuestos Chorry",
  ],
  authors: [{ name: BUSINESS.name }],
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: "RB Repuestos Chorry | Repuestos en General - Calidad Garantizada",
    description:
      "Repuestos multimarca: suspensión, pernos excéntricos, motor, frenos y transmisión. Asesoría técnica y envíos inmediatos.",
    images: [{ url: "/hero.jpg", width: 1200, height: 630, alt: BUSINESS.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RB Repuestos Chorry | Repuestos en General",
    description:
      "Repuestos multimarca con garantía real y entrega inmediata en Lima. Cotiza por WhatsApp.",
    images: ["/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  name: BUSINESS.name,
  slogan: BUSINESS.slogan,
  url: SITE_URL,
  telephone: BUSINESS.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.address,
    addressLocality: "Chorrillos, Lima",
    addressCountry: "PE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "17:00",
    },
  ],
  priceRange: "S/",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
