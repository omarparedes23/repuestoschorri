import type { Category } from "@/types/product";

interface ProductPlaceholderProps {
  category: Category | string;
  oemCode?: string;
  code?: string;
  size?: "sm" | "md" | "lg";
}

function CategoryTechnicalSvg({
  category,
  className = "h-12 w-12",
}: {
  category: Category | string;
  className?: string;
}) {
  switch (category) {
    case "Frenos":
      // Disco de freno ventilado y cáliper técnico
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r="24"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-navy/80"
          />
          <circle
            cx="32"
            cy="32"
            r="16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="text-brand"
          />
          <circle
            cx="32"
            cy="32"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            className="text-navy"
          />
          <circle cx="32" cy="32" r="3.5" fill="currentColor" className="text-brand" />
          {/* Perforaciones de ventilación */}
          <circle cx="32" cy="12" r="1.5" fill="currentColor" className="text-slate-400" />
          <circle cx="32" cy="52" r="1.5" fill="currentColor" className="text-slate-400" />
          <circle cx="12" cy="32" r="1.5" fill="currentColor" className="text-slate-400" />
          <circle cx="52" cy="32" r="1.5" fill="currentColor" className="text-slate-400" />
          {/* Mordaza / Cáliper */}
          <path
            d="M44 12C51 16 55 23.5 55 32C55 40.5 51 48 44 52L39 45C43.5 42 46.5 37.3 46.5 32C46.5 26.7 43.5 22 39 19L44 12Z"
            fill="currentColor"
            className="text-brand/20"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );

    case "Suspensión":
      // Amortiguador y resorte helicoidal
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {/* Ojal superior e inferior */}
          <circle
            cx="32"
            cy="10"
            r="4"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-navy"
          />
          <circle
            cx="32"
            cy="54"
            r="4"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-navy"
          />
          {/* Vástago central */}
          <line
            x1="32"
            y1="14"
            x2="32"
            y2="34"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-brand"
          />
          {/* Cuerpo del cilindro */}
          <rect
            x="26"
            y="34"
            width="12"
            height="16"
            rx="2"
            fill="currentColor"
            className="text-brand/15"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          {/* Espiral / Resorte */}
          <path
            d="M21 19L43 23L21 28L43 32L21 37"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-navy"
          />
          <line
            x1="19"
            y1="18"
            x2="45"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-slate-500"
          />
        </svg>
      );

    case "Pernos y Fijaciones":
      // Perno excéntrico de comba grado industrial
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {/* Cabeza hexagonal */}
          <path
            d="M20 14L26 9H38L44 14V20H20V14Z"
            fill="currentColor"
            className="text-brand/20"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          {/* Arandela excéntrica graduada */}
          <ellipse
            cx="32"
            cy="22"
            rx="16"
            ry="3.5"
            fill="currentColor"
            className="text-navy/15"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Vástago con leva excéntrica */}
          <rect
            x="27"
            y="25"
            width="11"
            height="14"
            rx="1.5"
            fill="currentColor"
            className="text-brand/15"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Rosca métrica */}
          <rect
            x="28"
            y="39"
            width="8"
            height="15"
            rx="1"
            stroke="currentColor"
            strokeWidth="2"
            className="text-navy"
          />
          <line x1="28" y1="43" x2="36" y2="43" stroke="currentColor" strokeWidth="1.6" className="text-brand" />
          <line x1="28" y1="47" x2="36" y2="47" stroke="currentColor" strokeWidth="1.6" className="text-brand" />
          <line x1="28" y1="51" x2="36" y2="51" stroke="currentColor" strokeWidth="1.6" className="text-brand" />
        </svg>
      );

    case "Motor":
      // Pistón y biela de motor
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {/* Cabeza de pistón */}
          <rect
            x="18"
            y="10"
            width="28"
            height="22"
            rx="3"
            fill="currentColor"
            className="text-brand/15"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          {/* Anillos de compresión */}
          <line x1="18" y1="15" x2="46" y2="15" stroke="currentColor" strokeWidth="1.8" className="text-brand" />
          <line x1="18" y1="19" x2="46" y2="19" stroke="currentColor" strokeWidth="1.8" className="text-brand" />
          {/* Bulón central */}
          <circle
            cx="32"
            cy="25"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            className="text-navy"
          />
          {/* Biela */}
          <path
            d="M29 29L27 45H37L35 29"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-navy"
          />
          {/* Bancada de cigüeñal */}
          <path
            d="M23 45C23 50 27 54 32 54C37 54 41 50 41 45"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="text-brand"
          />
        </svg>
      );

    case "Transmisión":
      // Disco de embrague / engranaje sincronizador
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            className="text-navy"
          />
          <circle
            cx="32"
            cy="32"
            r="16"
            fill="currentColor"
            className="text-brand/15"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Resortes amortiguadores torsionales */}
          <rect x="29" y="19" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" className="text-brand" />
          <rect x="29" y="41" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" className="text-brand" />
          <rect x="19" y="29" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" className="text-brand" />
          <rect x="41" y="29" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" className="text-brand" />
          {/* Estrías centrales */}
          <circle
            cx="32"
            cy="32"
            r="6"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-navy"
          />
        </svg>
      );

    case "Eléctrico y Encendido":
    default:
      // Bujía de encendido / bobina
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          {/* Terminal superior */}
          <path
            d="M30 9H34V15H30V9Z"
            fill="currentColor"
            className="text-brand"
          />
          {/* Aislador cerámico */}
          <rect
            x="26"
            y="15"
            width="12"
            height="16"
            rx="2"
            fill="currentColor"
            className="text-brand/15"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="26" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-brand" />
          <line x1="26" y1="25" x2="38" y2="25" stroke="currentColor" strokeWidth="1.5" className="text-brand" />
          {/* Cuerpo hexagonal */}
          <rect
            x="22"
            y="31"
            width="20"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="2.2"
            className="text-navy"
          />
          {/* Rosca y electrodo */}
          <rect
            x="26"
            y="39"
            width="12"
            height="11"
            stroke="currentColor"
            strokeWidth="2"
            className="text-navy/80"
          />
          <path
            d="M32 50V54M28 50V56H33"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
          />
        </svg>
      );
  }
}

export function ProductPlaceholder({
  category,
  oemCode,
  code,
  size = "md",
}: ProductPlaceholderProps) {
  if (size === "sm") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100/90 to-slate-200/70 bg-tech-grid text-navy">
        <CategoryTechnicalSvg category={category} className="h-8 w-8 text-navy/80" />
      </div>
    );
  }

  const isLarge = size === "lg";

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100/90 to-slate-200/60 bg-tech-grid p-4 select-none">
      {/* Esquinas de plano técnico CAD */}
      <div className="pointer-events-none absolute inset-3 border border-slate-300/50 rounded-xl">
        <span className="absolute -left-px -top-px h-2.5 w-2.5 border-l-2 border-t-2 border-brand/50 rounded-tl-sm" />
        <span className="absolute -right-px -top-px h-2.5 w-2.5 border-r-2 border-t-2 border-brand/50 rounded-tr-sm" />
        <span className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-brand/50 rounded-bl-sm" />
        <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-brand/50 rounded-br-sm" />
      </div>

      {/* Marca de agua OEM sutil */}
      {(oemCode || code) && (
        <span className="pointer-events-none absolute top-4 left-5 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400/80">
          {oemCode ? `SPEC // ${oemCode}` : `REF // ${code}`}
        </span>
      )}

      {/* Emblema central con ilustración técnica */}
      <div
        className={`relative flex items-center justify-center rounded-2xl border border-white/90 bg-white/85 shadow-sm backdrop-blur-sm transition-transform duration-500 group-hover:scale-105 ${
          isLarge ? "h-28 w-28" : "h-20 w-20"
        }`}
      >
        <div className="absolute inset-1.5 rounded-xl border border-dashed border-slate-200" />
        <CategoryTechnicalSvg
          category={category}
          className={isLarge ? "h-16 w-16 text-navy" : "h-12 w-12 text-navy"}
        />
      </div>

      {/* Placa técnica inferior */}
      <div className="mt-3 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Pieza Certificada
        </span>
        <span className="mt-1 text-[10px] font-medium text-slate-400">
          Esquema técnico · {category}
        </span>
      </div>
    </div>
  );
}
