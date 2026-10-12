import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { BUSINESS } from "@/lib/config";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#marcas", label: "Marcas" },
  { href: "#nosotros", label: "Nosotros" },
];

export function Footer() {
  return (
    <footer id="contacto" className="bg-navy text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 text-sm">{BUSINESS.slogan}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Enlaces rápidos
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Horario de atención
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {BUSINESS.hours.map((h) => (
              <li key={h.days} className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                <span>
                  <span className="block font-medium text-white">{h.days}</span>
                  {h.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
              {BUSINESS.address}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
              {BUSINESS.phone}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        © 2026 {BUSINESS.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
