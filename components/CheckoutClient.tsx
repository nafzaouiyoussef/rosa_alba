"use client";

import Link from "next/link";
import { useEffect } from "react";
import { fmt, lineTotal } from "@/lib/pricing";
import { tr } from "@/lib/tr";
import { useCart, useLang } from "./Providers";
import OrderForm from "./OrderForm";

export default function CheckoutClient({ shipping }: { shipping: number }) {
  const lang = useLang();
  const cart = useCart();

  // refresh prices from the server so admin price changes apply to old carts
  useEffect(() => {
    if (!cart.ready || !cart.lines.length) return;
    const ids = cart.lines.map((l) => l.product_id).join(",");
    fetch(`/api/products?ids=${encodeURIComponent(ids)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((fresh) => fresh && cart.refreshPrices(fresh))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.ready]);

  if (!cart.ready) return <div className="py-20 text-center text-ink/50">…</div>;

  if (!cart.lines.length) {
    return (
      <div className="py-16 text-center">
        <div className="text-5xl">🛍️</div>
        <h1 className="mt-4 font-serif text-3xl font-bold">{tr(lang, "Votre panier est vide", "سلتك فارغة")}</h1>
        <Link href="/#produits" className="btn-primary mt-6">{tr(lang, "Voir les produits", "تصفحي المنتجات")}</Link>
      </div>
    );
  }

  const subtotal = cart.lines.reduce((s, l) => s + lineTotal(l, l.qty), 0);

  return (
    <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
      <div>
        <h1 className="font-serif text-3xl font-bold">{tr(lang, "Votre commande", "طلبك")}</h1>
        <p className="mt-1 text-sm text-ink/60">{tr(lang, "Paiement à la livraison · Livraison gratuite", "الدفع عند الاستلام · توصيل مجاني")}</p>
        <ul className="mt-5 space-y-3">
          {cart.lines.map((l) => {
            const t = lineTotal(l, l.qty);
            return (
              <li key={l.product_id} className="card flex gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-200 font-serif text-sm font-bold">RA</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${l.slug}`} className="font-semibold leading-tight hover:text-brand-700">
                    {lang === "ar" && l.name_ar ? l.name_ar : l.name_fr}
                  </Link>
                  <div className="text-xs text-ink/50">{l.size}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-ink/15">
                      <button type="button" className="h-9 w-9 text-lg" onClick={() => cart.setQty(l.product_id, l.qty - 1)} aria-label="-">−</button>
                      <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                      <button type="button" className="h-9 w-9 text-lg" onClick={() => cart.setQty(l.product_id, l.qty + 1)} aria-label="+">+</button>
                    </div>
                    <div className="text-end">
                      <div className="font-bold">{fmt(t, lang)}</div>
                      {t < l.price * l.qty && <div className="text-xs text-ink/45 line-through">{fmt(l.price * l.qty, lang)}</div>}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => cart.remove(l.product_id)} className="self-start text-ink/40 hover:text-red-600" aria-label="Remove">✕</button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card h-fit p-5 sm:p-6 md:sticky md:top-24">
        <h2 className="font-serif text-2xl font-bold">{tr(lang, "Vos informations", "معلوماتك")}</h2>
        <div className="mt-4">
          <OrderForm
            items={cart.lines.map((l) => ({
              product_id: l.product_id,
              qty: l.qty,
              name: l.name_fr,
              price: l.price
            }))}
            total={subtotal}
            shipping={shipping}
            onSuccess={cart.clear}
          />
        </div>
      </div>
    </div>
  );
}
