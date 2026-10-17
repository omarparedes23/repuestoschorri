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

// Margen sobre la animación de salida de framer-motion (~300 ms) del menú móvil.
const MENU_EXIT_MS = 400;

const linkClass =
  "relative text-xs font-bold uppercase tracking-wider text-navy/75 transition-colors hover:text-navy after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100";

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

  // En móvil, cerrar el menú cancela un scroll suave que ya esté en curso (el ancla
  // cambia el hash pero la página no se mueve). Se cierra primero y se desplaza cuando
  // termina la animación de salida del menú.
  function goToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView();
      history.replaceState(null, "", href);
    }, MENU_EXIT_MS);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-slate-200/80 bg-white/95 py-1 shadow-md shadow-navy/5 backdrop-blur-xl"
          : "border-b border-slate-200/80 bg-white/95 py-2 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#inicio" aria-label="RB Repuestos Chorry - Inicio" className="flex items-center">
          <Logo className="h-14" />
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
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Botón del Cotizador / Carrito */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ver lista de cotización"
            className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-navy transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-95"
          >
            <ShoppingBag className="h-4 w-4 text-brand" />
            <span className="hidden sm:inline">Cotizador</span>
            {totalCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-black text-white shadow-sm">
                {totalCount}
              </span>
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 text-[10px] font-bold text-navy">
                0
              </span>
            )}
          </button>

          <a
            href={whatsappLink(GENERIC_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md sm:inline-flex"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-navy transition-colors hover:bg-slate-100 lg:hidden"
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
            className="overflow-hidden border-t border-slate-200/80 bg-white px-4 lg:hidden"
          >
            <ul className="flex flex-col py-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => goToSection(e, l.href)}
                    className="block rounded-lg px-3 py-3 text-sm font-bold uppercase tracking-wider text-navy/90 transition-colors hover:bg-slate-100"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2.5 pb-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDrawerOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-navy transition-colors hover:bg-slate-100"
              >
                <ShoppingBag className="h-4 w-4 text-brand" />
                Abrir Lista de Cotización
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-black text-white">
                  {totalCount}
                </span>
              </button>
              <a
                href={whatsappLink(GENERIC_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-emerald-500"
              >
                <WhatsAppIcon className="h-4 w-4" /> Asesor WhatsApp
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
