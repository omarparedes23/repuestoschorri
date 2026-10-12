import { BadgeCheck, Headset, Layers, Truck } from "lucide-react";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const ITEMS = [
  {
    icon: BadgeCheck,
    title: "Calidad garantizada",
    text: "Repuestos probados y con respaldo para que tu vehículo rinda como el primer día.",
  },
  {
    icon: Headset,
    title: "Asesoría técnica directa",
    text: "Te ayudamos a identificar la pieza exacta para tu modelo, sin errores ni devoluciones.",
  },
  {
    icon: Truck,
    title: "Envíos rápidos",
    text: "Despachamos de inmediato para que tu taller o tu auto no esperen.",
  },
  {
    icon: Layers,
    title: "Amplia variedad multimarca",
    text: "Toyota, Nissan, Ford, Hyundai, Kia y más: todo en un solo lugar.",
  },
];

export function Benefits() {
  return (
    <section id="nosotros" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Ventajas"
          title={
            <>
              ¿Por qué elegir <Highlight>RB Repuestos Chorry</Highlight>?
            </>
          }
          subtitle="Más que vender repuestos, te acompañamos para que tu auto vuelva a la pista cuanto antes."
        />
        <Reveal>
        <ul
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="group rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-brand shadow-lg shadow-navy/20 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-7 w-7 text-white" aria-hidden="true" />
              </span>
              <h3 className="mb-3 font-heading text-xl font-bold text-navy">{title}</h3>
              <p className="text-sm font-light leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ul>
        </Reveal>
      </div>
    </section>
  );
}
