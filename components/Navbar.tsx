"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { GENERIC_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { useQuote } from "@/context/QuoteContext";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#marcas", label: "Marcas" },
  { href: "#taller", label: "Local & Taller" },
  { href: "#nosotros", label: "Garantía" },
  { href: "#contacto", label: "Contacto" },
];

const linkClass =
  "relative text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalCount, setIsOpen: setDrawerOpen } = useQuote();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled || open
          ? "border-b border-white/10 bg-navy/95 py-2 shadow-xl backdrop-blur-xl"
          : "bg-navy/40 py-3 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#inicio" aria-label="RB Repuestos Chorry - Inicio" className="flex items-center">
          <Logo light />
        </a>

        {/* Navigation links */}
        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions (Cotizador Cart Button + WhatsApp) */}
        <div className="flex items-center gap-3">
          {/* Botón flotante del Cotizador / Carrito */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ver lista de cotización"
            className="relative inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 active:scale-95"
          >
            <ShoppingBag className="h-4 w-4 text-sky-300" />
            <span className="hidden sm:inline">Cotizador</span>
            {totalCount > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-black text-white shadow-md animate-pulse">
                {totalCount}
              </span>
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                0
              </span>
            )}
          </button>

          <a
            href={whatsappLink(GENERIC_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_18px_rgba(220,38,38,0.45)] transition-all hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-[0_0_26px_rgba(229,9,20,0.6)] sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Asesor WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Móvil"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-navy/95 px-4 lg:hidden"
          >
            <ul className="flex flex-col py-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-bold text-white/90 hover:bg-white/10 uppercase tracking-wider"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 pb-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDrawerOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-xs font-bold text-white"
              >
                <ShoppingBag className="h-4 w-4 text-sky-300" />
                Abrir Lista de Cotización ({totalCount})
              </button>
              <a
                href={whatsappLink(GENERIC_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs font-black uppercase tracking-wider text-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> Cotizar por WhatsApp
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
