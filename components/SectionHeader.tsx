import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}

export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center" }: Props) {
  return (
    <div
      className={align === "center" ? "mx-auto mb-14 max-w-2xl text-center" : "mb-10 max-w-2xl"}
    >
      <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-accent sm:text-sm">
        {eyebrow}
      </span>
      <h2 className="font-heading text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
