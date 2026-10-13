"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang, Product } from "@/lib/types";

/* ---------------- Language ---------------- */
const LangCtx = createContext<Lang>("fr");
export const useLang = () => useContext(LangCtx);

/* ---------------- Cart ---------------- */
export type CartLine = {
  product_id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  price: number;
  disc_2: number;
  disc_3: number;
  image: string;
  size: string;
  qty: number;
};

type CartApi = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (p: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  refreshPrices: (fresh: Pick<Product, "id" | "price" | "disc_2" | "disc_3">[]) => void;
  toast: string | null;
};

const CartCtx = createContext<CartApi | null>(null);
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("CartProvider missing");
  return c;
};

const KEY = "ra_cart_v1";

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const add = useCallback(
    (p: Product, qty = 1) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.product_id === p.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: Math.min(10, next[i].qty + qty) };
          return next;
        }
        return [
          ...prev,
          {
            product_id: p.id,
            slug: p.slug,
            name_fr: p.name_fr,
            name_ar: p.name_ar,
            price: Number(p.price),
            disc_2: Number(p.disc_2),
            disc_3: Number(p.disc_3),
            image: p.images?.[0] || "",
            size: p.size,
            qty: Math.min(10, qty)
          }
        ];
      });
      flash(lang === "ar" ? "تمت الإضافة إلى السلة ✓" : "Ajouté au panier ✓");
    },
    [flash, lang]
  );

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.product_id === id ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)));
  }, []);
  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.product_id !== id)), []);
  const clear = useCallback(() => setLines([]), []);
  const refreshPrices = useCallback((fresh: Pick<Product, "id" | "price" | "disc_2" | "disc_3">[]) => {
    setLines((prev) =>
      prev
        .filter((l) => fresh.some((f) => f.id === l.product_id))
        .map((l) => {
          const f = fresh.find((x) => x.id === l.product_id)!;
          return { ...l, price: Number(f.price), disc_2: Number(f.disc_2), disc_3: Number(f.disc_3) };
        })
    );
  }, []);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      ready,
      add,
      setQty,
      remove,
      clear,
      refreshPrices,
      toast
    }),
    [lines, ready, add, setQty, remove, clear, refreshPrices, toast]
  );

  return (
    <LangCtx.Provider value={lang}>
      <CartCtx.Provider value={value}>
        {children}
        {toast && (
          <div className="pop fixed inset-x-0 bottom-24 z-[70] mx-auto w-fit rounded-full bg-ink px-5 py-3 text-sm font-medium text-white shadow-soft">
            {toast}
          </div>
        )}
      </CartCtx.Provider>
    </LangCtx.Provider>
  );
}
