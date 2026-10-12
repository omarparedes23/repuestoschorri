import type { Category } from "@/types/product";

// Categorías de referencia para los controles de UI (Hero, tabs del catálogo).
// Los PRODUCTOS ya NO viven aquí: el catálogo se lee de Supabase (lib/products.ts).
export const CATEGORIES: readonly Category[] = [
  "Pernos y Fijaciones",
  "Suspensión",
  "Motor",
  "Frenos",
  "Transmisión",
  "Eléctrico y Encendido",
] as const;

export interface CategoryInfo {
  id: Category;
  title: string;
  count: string;
  image: string;
  description: string;
}

export const FEATURED_CATEGORIES: CategoryInfo[] = [
  {
    id: "Frenos",
    title: "Sistema de Frenos",
    count: "+1,200 repuestos",
    image: "https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=800&q=80",
    description: "Discos ventilados, pastillas cerámicas, cálipers y cilindros maestros de alta respuesta térmica.",
  },
  {
    id: "Suspensión",
    title: "Suspensión y Dirección",
    count: "+950 repuestos",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
    description: "Amortiguadores a gas, espirales, terminales, rótulas y bieletas de servicio pesado.",
  },
  {
    id: "Pernos y Fijaciones",
    title: "Pernos Excéntricos y Camber",
    count: "+400 medidas",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    description: "Especialistas en pernos de comba y alineación grado 10.9 y 12.9 para corrección de caída.",
  },
  {
    id: "Motor",
    title: "Motor y Distribución",
    count: "+1,800 repuestos",
    image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80",
    description: "Kits de distribución, bombas de agua, filtros de alto flujo y retenes de alta presión.",
  },
  {
    id: "Transmisión",
    title: "Embragues y Transmisión",
    count: "+650 repuestos",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    description: "Kits de embrague con plato y collarín, juntas homocinéticas, semiejes y fuelles.",
  },
  {
    id: "Eléctrico y Encendido",
    title: "Eléctrico y Encendido",
    count: "+850 repuestos",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
    description: "Bujías Iridium/Platinum, bobinas de encendido, alternadores y arrancadores de precisión.",
  },
];
