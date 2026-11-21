import type { Product, Settings } from "./types";

export type BundleKind = "full" | "essential";

/** "Pack Essentiel": serum + night cream + mask, with the face scrub offered as a gift. */
export const ESSENTIAL_SLUGS = ["serum-anti-age", "creme-de-nuit-anti-age", "masque-eclat-rose"];
export const GIFT_SLUG = "gel-gommage-visage";

export const essentialPct = (s: Settings) => Math.max(0, Math.min(50, Number(s.bundle2_discount_pct) || 0));

export const essentialProducts = (all: Product[]) =>
  ESSENTIAL_SLUGS.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Product => !!p && p.stock > 0);

export const giftProduct = (all: Product[], s: Settings) =>
  s.gift_enabled ? all.find((p) => p.slug === GIFT_SLUG && p.stock > 0) || null : null;
