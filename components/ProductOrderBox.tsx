"use client";

import { useState } from "react";
import type { Product, Settings } from "@/lib/types";
import { discountFor, fmt, lineTotal } from "@/lib/pricing";
import { pick, tr } from "@/lib/tr";
import { useCart, useLang } from "./Providers";
import OrderForm from "./OrderForm";
import { trackAddToCart } from "@/lib/track";

/** Offer selector (1 / 2 / 3 units) + one-page COD order form. Used on product pages and ad landing pages. */
export default function ProductOrderBox({ product, settings, heading }: { product: Product; settings: Settings; heading?: string }) {
  const lang = useLang();
  const cart = useCart();
  const [qty, setQty] = useState(2);
  const name = pick(product, "name", lang) as string;
  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(3, product.stock || 3));
  const options = [1, 2, 3].filter((q) => q <= Math.max(1, maxQty));
  const current = Math.min(qty, options[options.length - 1]);

  const total = lineTotal(product, current);
  const full = Number(product.price) * current;

  return (
    <div id="order" className="card scroll-mt-24 p-5 sm:p-6">
      <h2 className="font-serif text-2xl font-bold">
        {heading || tr(lang, "Commandez maintenant", "اطلبي الآن")}
      </h2>
      <p className="mt-1 text-sm text-ink/65">
        {tr(lang, "Paiement à la livraison · Livraison gratuite", "الدفع عند الاستلام · توصيل مجاني")}
      </p>

      {soldOut ? (
        <div className="mt-4 rounded-xl bg-sand p-4 text-sm font-medium">
          {tr(lang, "Rupture de stock pour le moment.", "نفدت الكمية حالياً.")}
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-2.5">
            {options.map((q) => {
              const d = discountFor(q, product);
              const t = lineTotal(product, q);
              const selected = current === q;
              return (
                <button
                  type="button"
                  key={q}
                  onClick={() => setQty(q)}
                  className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-start transition ${
                    selected ? "border-brand-500 bg-brand-50" : "border-ink/10 bg-white hover:border-ink/30"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-brand-500" : "border-ink/30"}`}>
                      {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
                    </span>
                    <span>
                      <span className="block font-semibold">
                        {q === 1 ? tr(lang, "1 unité", "قطعة واحدة") : q === 2 ? tr(lang, "2 unités", "قطعتان") : tr(lang, "3 unités", "3 قطع")}
                      </span>
                      {d > 0 && (
                        <span className="mt-0.5 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-[#7a5d1c]">
                          {tr(lang, `-${d}% · économisez ${fmt(Number(product.price) * q - t, lang)}`, `خصم ${d}% · وفّري ${fmt(Number(product.price) * q - t, lang)}`)}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="text-end">
                    <span className="block text-lg font-bold">{fmt(t, lang)}</span>
                    {d > 0 && <span className="block text-xs text-ink/45 line-through">{fmt(Number(product.price) * q, lang)}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="mt-3 text-sm font-semibold text-red-600">
              {tr(lang, `🔥 Plus que ${product.stock} en stock`, `🔥 بقيت ${product.stock} قطع فقط`)}
            </p>
          )}

          <div className="mt-5">
            <OrderForm
              items={[{ product_id: product.id, qty: current, name, price: Number(product.price) }]}
              total={total}
              shipping={settings.shipping_fee}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              cart.add(product, current);
              trackAddToCart({ id: product.id, name, price: Number(product.price), qty: current });
            }}
            className="mt-3 w-full text-center text-sm font-medium text-ink/60 underline underline-offset-4 hover:text-ink"
          >
            {tr(lang, "Ajouter au panier et continuer mes achats", "أضيفي إلى السلة وتابعي التسوق")}
          </button>
        </>
      )}
      <span className="sr-only">{full}</span>
    </div>
  );
}
