"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { metricas } from "@/data/content";

function Contador({ valor, sufijo }: { valor: string; sufijo?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const objetivo = parseInt(valor, 10);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const duracion = 1500;
    const inicio = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - inicio) / duracion, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * objetivo).toLocaleString("es-PE"));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, objetivo]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {sufijo}
    </span>
  );
}

export function Metricas() {
  return (
    <section className="border-y border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-4">
          {metricas.map((m) => (
            <div key={m.etiqueta} className="flex flex-col-reverse text-center">
              <dd className="mb-2 bg-gradient-to-br from-navy to-brand bg-clip-text font-heading text-4xl font-extrabold text-transparent sm:text-5xl">
                <Contador valor={m.valor} sufijo={m.sufijo} />
              </dd>
              <dt className="text-sm font-medium uppercase tracking-wider text-slate-600 sm:text-base">
                {m.etiqueta}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
