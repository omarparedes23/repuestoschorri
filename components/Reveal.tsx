"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { viewportOnce } from "./shared/animations";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Única isla de animación para secciones de servidor.
 * Las secciones son Server Components y envuelven su contenido
 * en <Reveal> en lugar de marcar todo el fichero "use client".
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
