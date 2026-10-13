"use client";

import type { Product, Settings } from "@/lib/types";
import { fmt, lineTotal } from "@/lib/pricing";
import { pick, tr } from "@/lib/tr";
import { useLang } from "./Providers";
import OrderForm from "./OrderForm";
import ProductImage from "./ProductImage";

/** "Routine complète" pack: every in-stock product at the bundle discount, ordered with the same COD form. */
export default function BundleOrderBox({ products, settings }: { products: Product[]; settings: Settings }) {
  const lang = useLang();
  const pct = Math.max(0, Math.min(50, Number(settings.bundle_discount_pct) || 0));
  const list = products.filter((p) => p.stock > 0);
  const full = list.reduce((s, p) => s + Number(p.price), 0);
  const total = list.reduce((s, p) => s + lineTotal(p, 1, pct), 0);

  return (
    <div id="order" className="card scroll-mt-24 p-5 sm:p-6">
      <h2 className="font-serif text-2xl font-bold">{tr(lang, "Commandez la routine complète", "اطلبي الروتين الكامل")}</h2>
      <p className="mt-1 text-sm text-ink/65">
        {tr(lang, "Paiement à la livraison · Livraison gratuite", "الدفع عند الاستلام · توصيل مجاني")}
      </p>

      <ul className="mt-4 divide-y divide-ink/10 rounded-2xl bg-brand-50 px-3">
        {list.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-2.5">
            <span className="h-14 w-12 shrink-0 overflow-hidden rounded-lg">
              <ProductImage product={p} lang={lang} />
            </span>
            <span className="flex-1 text-sm font-medium leading-tight">{pick(p, "name", lang) as string}</span>
            <span className="text-sm text-ink/60 line-through">{fmt(Number(p.price), lang)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-end justify-between rounded-2xl border-2 border-brand-500 bg-white px-4 py-3">
        <div>
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-[#7a5d1c]">
            {tr(lang, `-${pct}% · vous économisez ${fmt(full - total, lang)}`, `خصم ${pct}% · وفّري ${fmt(full - total, lang)}`)}
          </span>
        </div>
        <div className="text-end">
          <div className="text-xs text-ink/45 line-through">{fmt(full, lang)}</div>
          <div className="text-2xl font-bold">{fmt(total, lang)}</div>
        </div>
      </div>

      <div className="mt-5">
        <OrderForm
          bundle
          items={list.map((p) => ({ product_id: p.id, qty: 1, name: pick(p, "name", lang) as string, price: Number(p.price) }))}
          total={total}
          shipping={settings.shipping_fee}
          ctaLabel={tr(lang, "Commander ma routine — Paiement à la livraison", "اطلبي روتيني — الدفع عند الاستلام")}
        />
      </div>
    </div>
  );
}
