export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="9" fill="#0066CC" />
        <path
          d="M10 29V11h9.5a5.5 5.5 0 0 1 1.6 10.8L26 29h-4.6l-4.2-6.6H14.2V29H10Zm4.2-10h5.1a2 2 0 0 0 0-4h-5.1v4Z"
          fill="#fff"
        />
        <path d="M27 11h3.5L34 29h-3.5L27 11Z" fill="#DC2626" />
      </svg>
      <span className="leading-none">
        <span
          className={`block text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-navy"}`}
        >
          RB Repuestos
        </span>
        <span className="block text-xs font-bold uppercase tracking-[0.25em] text-accent">
          Chorry
        </span>
      </span>
    </span>
  );
}
