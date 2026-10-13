"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { quickUpdateProduct } from "@/app/admin/actions";

export default function QuickProductRow({ p }: { p: Product }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(p.price));
  const [stock, setStock] = useState(String(p.stock));
  const [active, setActive] = useState(p.is_active);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const dirty = price !== String(p.price) || stock !== String(p.stock) || active !== p.is_active;

  function save() {
    start(async () => {
      const r = await quickUpdateProduct(p.id, { price: Number(price), stock: Number(stock), is_active: active });
      setMsg(r.ok ? "✓" : r.error || "Erreur");
      if (r.ok) router.refresh();
      setTimeout(() => setMsg(""), 2500);
    });
  }

  return (
    <tr>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-brand-100">
            {p.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-brand-700">{p.name_fr}</Link>
            <div className="text-xs text-ink/50">{p.size} · /{p.slug}</div>
          </div>
        </div>
      </td>
      <td className="p-4"><input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="w-24 rounded-lg border border-ink/15 px-2 py-1.5" /></td>
      <td className="p-4"><input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="w-20 rounded-lg border border-ink/15 px-2 py-1.5" /></td>
      <td className="p-4"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5 accent-[#1799b0]" /></td>
      <td className="p-4 text-xs">
        <Link href={`/products/${p.slug}`} target="_blank" className="block text-brand-700 hover:underline">Page produit ↗</Link>
        <Link href={`/lp/${p.slug}`} target="_blank" className="block text-brand-700 hover:underline">Landing pub ↗</Link>
      </td>
      <td className="p-4 text-end">
        <button onClick={save} disabled={!dirty || pending} className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-30">
          {pending ? "…" : "Enregistrer"}
        </button>
        {msg && <span className="ms-2 text-xs">{msg}</span>}
      </td>
    </tr>
  );
}
