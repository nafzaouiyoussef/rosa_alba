"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteReview, saveReview, toggleReview } from "@/app/admin/actions";

type R = { id: string; author: string; city: string; rating: number; body: string; is_approved: boolean; product_name?: string };

export default function ReviewManager({ products, reviews }: { products: { id: string; name: string }[]; reviews: R[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({ product_id: "", author: "", city: "", rating: 5, body: "", is_approved: true });

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? "✓" : r.error || "Erreur");
      if (r.ok) {
        after?.();
        router.refresh();
      }
      setTimeout(() => setMsg(""), 2500);
    });

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-semibold">Ajouter un avis</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Produit</label>
            <select className="input !py-2.5" value={f.product_id} onChange={(e) => setF({ ...f, product_id: e.target.value })}>
              <option value="">Tous les produits (page d&apos;accueil)</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Note</label>
            <select className="input !py-2.5" value={f.rating} onChange={(e) => setF({ ...f, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
            </select>
          </div>
          <div><label className="label">Prénom / nom</label><input className="input !py-2.5" value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} /></div>
          <div><label className="label">Ville</label><input className="input !py-2.5" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
        </div>
        <div className="mt-3"><label className="label">Avis</label><textarea rows={3} className="input !py-2.5" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
        <div className="mt-4 flex items-center gap-3">
          <button
            disabled={pending}
            onClick={() => run(() => saveReview({ ...f, product_id: f.product_id || null }), () => setF({ ...f, author: "", city: "", body: "" }))}
            className="btn-primary !px-6 !py-2.5 text-sm"
          >
            Ajouter
          </button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </section>

      <section className="rounded-2xl bg-white shadow-soft">
        {reviews.length === 0 && <p className="p-8 text-center text-sm text-ink/50">Aucun avis pour l&apos;instant.</p>}
        <ul className="divide-y divide-ink/10">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                  <span className="text-[#c9a45c]">{"★".repeat(r.rating)}</span> {r.author}
                  {r.city && <span className="font-normal text-ink/50"> · {r.city}</span>}
                </div>
                <div className="text-xs text-ink/50">{r.product_name || "Tous les produits"}</div>
                <p className="mt-2 text-sm text-ink/80">{r.body}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" className="h-4 w-4 accent-[#1799b0]" checked={r.is_approved} disabled={pending} onChange={(e) => run(() => toggleReview(r.id, e.target.checked))} />
                  Publié
                </label>
                <button disabled={pending} onClick={() => confirm("Supprimer cet avis ?") && run(() => deleteReview(r.id))} className="text-red-600 hover:underline">Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
