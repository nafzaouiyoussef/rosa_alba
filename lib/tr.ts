import type { Lang } from "./types";

/** Inline bilingual helper: tr(lang, "Bonjour", "مرحبا") */
export const tr = (lang: Lang, fr: string, ar: string) => (lang === "ar" ? ar || fr : fr);

/** pick(product, "name", lang) -> product.name_ar (falls back to _fr) */
export function pick<T extends Record<string, any>>(obj: T, base: string, lang: Lang): any {
  const ar = obj[`${base}_ar`];
  const fr = obj[`${base}_fr`];
  if (lang === "ar") {
    if (Array.isArray(ar) ? ar.length : ar) return ar;
  }
  return fr;
}
