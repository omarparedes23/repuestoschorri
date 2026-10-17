import { MapPin, Clock, Phone, Navigation, Wrench, ShieldAlert } from "lucide-react";
import { BUSINESS } from "@/lib/config";
import { Highlight, SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { whatsappLink } from "@/lib/whatsapp";

export function WorkshopLocation() {
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${BUSINESS.name} ${BUSINESS.address}`
  )}`;

  return (
    <section className="bg-white py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Local y Taller"
          title={
            <>
              Visítanos o <Highlight>retira en tienda</Highlight>
            </>
          }
          subtitle="Atención personalizada para mecánicos, talleres especializados y dueños de vehículos particulares."
        />

        <Reveal>
        <div
          className="grid gap-8 lg:grid-cols-12 items-stretch"
        >
          {/* Tarjeta de información directa */}
          <div
            className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-navy p-8 text-white shadow-xl"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md">
                <Wrench className="h-3.5 w-3.5" /> Punto de Venta & Mostrador
              </div>

              <h3 className="mt-4 font-heading text-2xl font-black">
                {BUSINESS.name}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Mostrador de repuestos, pernos de alineación y asesoría en el acto.
              </p>

              <div className="mt-8 space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Ubicación
                    </span>
                    <p className="font-medium text-white">{BUSINESS.address}</p>
                    <span className="text-xs text-slate-400">La Victoria, Lima - Perú</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Horarios de Entrega & Despacho
                    </span>
                    {BUSINESS.hours.map((h) => (
                      <p key={h.days} className="text-xs text-slate-200">
                        <strong className="text-white">{h.days}:</strong> {h.time}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Central Telefónica & WhatsApp
                    </span>
                    <a
                      href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                      className="font-medium text-white transition-colors hover:text-sky-300"
                    >
                      {BUSINESS.phone}
                    </a>
                    <span className="block text-xs text-slate-400">
                      Mostrador en La Victoria & coordinación de taller en Chorrillos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-navy transition-colors hover:bg-slate-100"
              >
                <Navigation className="h-4 w-4" /> Cómo llegar con GPS
              </a>
              <a
                href={whatsappLink(
                  "Hola RB Repuestos Chorry, quisiera saber cómo llegar a su local o coordinar retiro de un repuesto."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
              >
                <WhatsAppIcon className="h-4 w-4" /> Coordinar Visita
              </a>
            </div>
          </div>

          {/* Mapa interactivo estilizado y beneficios de retiro */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* Mapa embed interactivo de Google Maps */}
            <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-inner">
              <iframe
                title="Ubicación RB Repuestos Chorry"
                src={`https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.address)}&output=embed`}
                className="h-full min-h-[320px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Garantías de retiro */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-navy">
                  <ShieldAlert className="h-4 w-4 text-brand" />
                  Muestra física y verificación
                </div>
                <p className="mt-1.5 text-xs font-normal leading-relaxed text-slate-600">
                  ¿Tienes la muestra rota o gastada? Tráela a nuestro mostrador y la medimos con vernier para darte el reemplazo exacto.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-navy">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                  Envíos a provincia diarios
                </div>
                <p className="mt-1.5 text-xs font-normal leading-relaxed text-slate-600">
                  Despachamos por Shalom, Marvisur, Olva Courier y agencias de carga el mismo día hábil con comprobante de remisión.
                </p>
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
