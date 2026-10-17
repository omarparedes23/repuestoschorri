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
    <section className="relative z-20 -mt-12 sm:-mt-16 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <ul className="flex flex-col items-stretch justify-around gap-5 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-navy/5 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-8 sm:p-7">
          {ITEMS.map(({ icon: Icon, tone, text }) => (
            <li key={text} className="flex items-center gap-3.5">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-navy sm:text-[15px]">{text}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
