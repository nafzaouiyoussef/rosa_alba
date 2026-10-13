"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { fmt } from "@/lib/pricing";
import { pick, tr } from "@/lib/tr";
import { useLang } from "./Providers";
import ProductImage from "./ProductImage";

export default function UpsellCard({
  product,
  orderNumber,
  token,
  price,
  fullPrice
}: {
  product: Product;
  orderNumber: string;
  token: string;
  price: number;
  fullPrice: number;
}) {
  const lang = useLang();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function add() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/orders/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber, token, product_id: product.id })
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "error");
      router.refresh();
    } catch (e: any) {
      setBusy(false);
      setErr(tr(lang, "Offre indisponible.", "العرض غير متاح."));
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] bg-brand-50">
        <ProductImage product={product} lang={lang} />
      </div>
      <div className="p-4">
        <div className="font-serif text-xl font-bold leading-tight">{pick(product, "name", lang)}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold">{fmt(price, lang)}</span>
          <span className="text-sm text-ink/45 line-through">{fmt(fullPrice, lang)}</span>
        </div>
        <button onClick={add} disabled={busy} className="btn-brand mt-3 w-full !py-3 text-sm">
          {busy ? "…" : tr(lang, "Ajouter à ma commande", "أضيفي إلى طلبي")}
        </button>
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      </div>
    </div>
  );
}
