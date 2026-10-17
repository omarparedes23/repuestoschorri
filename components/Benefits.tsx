import { BadgeCheck, Headset, Layers, Truck } from "lucide-react";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const ITEMS = [
  {
    icon: BadgeCheck,
    audience: "Particulares & Conductores",
    title: "Diagnóstico de pieza exacta",
    text: "Trae tu muestra o envíanos foto por WhatsApp: medimos con vernier para que compres una sola vez sin errores.",
  },
  {
    icon: Headset,
    audience: "Talleres Mecánicos",
    title: "Cotización técnica en minutos",
    text: "Atención prioritaria para maestros mecánicos, precios por volumen y verificación por catálogo OEM.",
  },
  {
    icon: Truck,
    audience: "Clientes en Provincias",
    title: "Embalaje y despacho diario",
    text: "Dejamos tu pedido en Shalom, Marvisur u Olva el mismo día y te enviamos la clave y guía por WhatsApp.",
  },
  {
    icon: Layers,
    audience: "Flotas & Empresas",
    title: "Stock multimarca permanente",
    text: "Toyota, Nissan, Hyundai, Kia, Mitsubishi y más con facturación electrónica inmediata (RUC 20).",
  },
];

export function Benefits() {
  return (
    <section id="nosotros" className="border-t border-slate-100 bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Ventajas para Flotas, Talleres y Particulares"
          title={
            <>
              ¿Por qué elegir <Highlight>RB Repuestos Chorry</Highlight>?
            </>
          }
          subtitle="Soluciones a medida tanto si buscas una pieza específica para tu auto como si abasteces un taller mecánico o flota comercial."
        />
        <Reveal>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ITEMS.map(({ icon: Icon, audience, title, text }) => (
              <li
                key={title}
                className="group relative flex flex-col rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-xl hover:shadow-navy/5"
              >
                <div className="mb-5 flex items-center justify-between gap-2">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white shadow-md shadow-navy/15 transition-transform duration-300 group-hover:scale-105 group-hover:bg-brand">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy/80">
                    {audience}
                  </span>
                </div>
                <h3 className="mb-2.5 font-heading text-lg font-bold text-navy">{title}</h3>
                <p className="text-sm font-normal leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
