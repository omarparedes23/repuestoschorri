"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "@/types/product";
import { cartLineSchema, type CartLine } from "@/lib/product-schema";
import { VALID_PRODUCT_IDS, getCatalogSync } from "@/lib/products";

interface QuoteContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

const STORAGE_KEY = "rb_quote_cart_v2";

function toStoredLine(value: unknown): CartLine | null {
  const parsed = cartLineSchema.safeParse(value);
  if (!parsed.success || !VALID_PRODUCT_IDS.has(parsed.data.id)) return null;
  return parsed.data;
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

/** Solo persiste {id, qty}. El Product completo se rehidrata desde el catálogo. */
export function parseStored(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const lines: CartLine[] = [];
    for (const entry of parsed) {
      const line = toStoredLine(entry);
      if (line && !seen.has(line.id)) {
        seen.add(line.id);
        lines.push(line);
      }
    }
    return lines;
  } catch {
    return [];
  }
}

export function QuoteProvider({ children }: { children: ReactNode }) {
  // localStorage como store externo (patrón useSyncExternalStore):
  // sin efectos de hidratación, con snapshot de servidor "[]" y
  // sincronización entre pestañas vía el evento "storage".
  const raw = useSyncExternalStore(
    subscribeToStorage,
    getStoredRaw,
    () => "[]"
  );
  const lines = useMemo(() => parseStored(raw), [raw]);
  // Re-render del mismo tab tras escribir (el evento "storage" no
  // se dispara en la pestaña que escribe).
  const [, setTick] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  function persist(next: CartLine[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // almacenamiento lleno o bloqueado: se ignora sin romper la app
    }
    setTick((t) => t + 1);
  }

  const addItem = (product: Product, quantity = 1) => {
    if (!VALID_PRODUCT_IDS.has(product.id)) return;
    const qty = Math.min(Math.max(Math.floor(quantity) || 1, 1), 99);
    const existing = lines.find((l) => l.id === product.id);
    persist(
      existing
        ? lines.map((l) =>
            l.id === product.id ? { ...l, qty: Math.min(l.qty + qty, 99) } : l
          )
        : [...lines, { id: product.id, qty }]
    );
  };

  const removeItem = (productId: string) => {
    persist(lines.filter((l) => l.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    persist(
      lines.map((l) =>
        l.id === productId
          ? { ...l, qty: Math.min(Math.max(Math.floor(quantity), 1), 99) }
          : l
      )
    );
  };

  const clearCart = () => {
    persist([]);
  };

  // Rehidrata el Product desde el catálogo validado: nunca confía en lo guardado.
  const items = useMemo<CartItem[]>(
    () =>
      lines.flatMap((l) => {
        const product = getCatalogSync().find((p) => p.id === l.id);
        return product ? [{ product, quantity: l.qty }] : [];
      }),
    [lines]
  );

  const totalCount = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  return (
    <QuoteContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        isOpen,
        setIsOpen,
        quickViewProduct,
        setQuickViewProduct,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return ctx;
}
