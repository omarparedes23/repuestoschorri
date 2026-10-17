import { Clock, MapPin, Phone, Truck, Wrench } from "lucide-react";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { BUSINESS } from "@/lib/config";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#marcas", label: "Marcas" },
  { href: "#taller", label: "Local y Taller" },
  { href: "#nosotros", label: "Garantía y Ventajas" },
  { href: "#faq", label: "Preguntas Frecuentes" },
];

export function Footer() {
  return (
    <footer id="contacto" className="border-t border-white/10 bg-navy text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <Logo onDark className="h-12" />
          <p className="mt-4 text-sm font-normal leading-relaxed text-slate-300">
            {BUSINESS.slogan}. Especialistas en suspensión, frenos y pernos excéntricos de alineación para todo el Perú.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Truck className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
              Envíos diarios a provincias vía Shalom, Marvisur y Olva Courier
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Wrench className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              Mostrador en La Victoria y servicio de taller en Chorrillos
            </span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Enlaces rápidos
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Horario de atención
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {BUSINESS.hours.map((h) => (
              <li key={h.days} className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-white">{h.days}</span>
                  <span className="text-slate-300">{h.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Contacto Directo
          </h3>
          <ul className="mt-4 space-y-3.5 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
              <span>{BUSINESS.address}</span>
            </li>
            <li>
              <a
                href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                <span>{BUSINESS.phone}</span>
              </a>
            </li>
            <li>
              <a
                href={whatsappLink(GENERIC_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-600 hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp Directo: {BUSINESS.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
        © 2026 {BUSINESS.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
