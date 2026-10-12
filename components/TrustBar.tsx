import { BadgeCheck, MapPin, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/config";
import { Reveal } from "./Reveal";

const ITEMS = [
  { icon: BadgeCheck, tone: "bg-navy/5 text-navy", text: "Garantía en todos nuestros repuestos" },
  { icon: MessageCircle, tone: "bg-accent/10 text-accent", text: "Asesoría directa por WhatsApp" },
  { icon: MapPin, tone: "bg-navy/5 text-navy", text: BUSINESS.address },
];

export function TrustBar() {
  return (
    <section className="relative z-20 -mt-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <Reveal>
      <ul
        className="flex flex-col items-stretch justify-around gap-6 rounded-2xl border border-white bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:gap-10 sm:p-8"
      >
        {ITEMS.map(({ icon: Icon, tone, text }) => (
          <li key={text} className="flex items-center gap-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-navy sm:text-base">{text}</p>
          </li>
        ))}
      </ul>
      </Reveal>
    </section>
  );
}
