import { ShieldCheck, Truck, Wrench, Clock, Award, FileSpreadsheet } from "lucide-react";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Garantía de 6 a 12 Meses",
    description: "Todos los repuestos cuentan con respaldo directo contra defectos de fábrica y garantía de ajuste OEM milimétrico.",
    tag: "100% Protegido",
  },
  {
    icon: Wrench,
    title: "Asesoría por Técnicos Especialistas",
    description: "No arriesgues tu dinero. Verificamos con catálogo de partes oficial y ficha técnica antes de despachar cada repuesto.",
    tag: "Cero Devoluciones",
  },
  {
    icon: Truck,
    title: "Despachos y Envíos el Mismo Día",
    description: "Envíos directos a todo Lima Metropolitana y provincias a través de Shalom, Marvisur y agencias autorizadas.",
    tag: "Rápido & Seguro",
  },
  {
    icon: Award,
    title: "Repuestos Nuevos & Certificados",
    description: "Solo comercializamos componentes fabricados bajo normas ISO/TS 16949 de grado equipo original o superior.",
    tag: "Calidad Probada",
  },
  {
    icon: FileSpreadsheet,
    title: "Atención Especial para Talleres",
    description: "Precios especiales por lote, facturación inmediata y cotizaciones consolidadas en menos de 5 minutos.",
    tag: "Convenio Talleres",
  },
  {
    icon: Clock,
    title: "Más de 10 Años de Experiencia",
    description: "Una década solucionando problemas de comba, ruidos de suspensión, frenos y mantenimiento mayor en Lima.",
    tag: "Trayectoria Real",
  },
];

export function TrustBadges() {
  return (
    <section className="bg-white py-20 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Respaldo Total"
          title={
            <>
              Tu vehículo y tu taller en <Highlight>las mejores manos</Highlight>
            </>
          }
          subtitle="Comprar repuestos debe darte tranquilidad absoluta. Conoce los pilares que nos convierten en el proveedor favorito de mecánicos y conductores."
        />

        <Reveal>
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TRUST_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative rounded-3xl border border-slate-200/80 bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-brand text-white shadow-md shadow-navy/20 group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-200/70 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                    {item.tag}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-lg font-bold text-ink">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
        </Reveal>
      </div>
    </section>
  );
}
