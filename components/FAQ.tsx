"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/content";
import { Highlight, SectionHeader } from "./SectionHeader";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-slate-200/60 bg-surface py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Dudas frecuentes"
          title={
            <>
              Preguntas <Highlight>frecuentes</Highlight>
            </>
          }
          subtitle="Resolvemos tus consultas sobre compatibilidad, envíos a provincias y garantía."
        />
        <ul className="space-y-3.5">
          {faqs.map((f, i) => {
            const open = openIndex === i;
            return (
              <li
                key={f.pregunta}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                  open
                    ? "border-brand/30 shadow-md shadow-navy/5"
                    : "border-slate-200/80 shadow-sm hover:border-slate-300"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-heading text-base font-bold text-navy transition-colors hover:text-brand sm:text-lg"
                  >
                    {f.pregunta}
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-accent transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="border-t border-slate-100 px-6 pb-5 pt-3 text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
                        {f.respuesta}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
