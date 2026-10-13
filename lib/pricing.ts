import type { Product } from "./types";

export function discountFor(qty: number, p: Pick<Product, "disc_2" | "disc_3">): number {
  if (qty >= 3) return Number(p.disc_3) || 0;
  if (qty === 2) return Number(p.disc_2) || 0;
  return 0;
}

export function lineTotal(p: Pick<Product, "price" | "disc_2" | "disc_3">, qty: number, extraPct = 0): number {
  const pct = Math.min(90, discountFor(qty, p) + extraPct);
  return Math.round(Number(p.price) * qty * (1 - pct / 100));
}

export const fmt = (n: number, lang: "fr" | "ar" = "fr") =>
  lang === "ar" ? `${Math.round(n)} د.م` : `${Math.round(n)} MAD`;
