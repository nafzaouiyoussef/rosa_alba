"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import ImageUploader from "./ImageUploader";

type F = Omit<Product, "benefits_fr" | "benefits_ar" | "images" | "compare_at_price"> & {
  benefits_fr: string;
  benefits_ar: string;
  images: string[];
  compare_at_price: string;
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export default function ProductForm({ product, isNew }: { product: Product; isNew: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<F>({
    ...product,
    benefits_fr: (product.benefits_fr || []).join("\n"),
    benefits_ar: (product.benefits_ar || []).join("\n"),
    images: product.images || [],
    compare_at_price: product.compare_at_price == null ? "" : String(product.compare_at_price)
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof F, v: any) => setF((s) => ({ ...s, [k]: v }));

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveProduct({ ...f, id: isNew ? undefined : product.id });
      if (!r.ok) return setMsg({ ok: false, text: r.error || "Erreur" });
      setMsg({ ok: true, text: "Enregistré ✓" });
      if (isNew && r.id) router.replace(`/admin/products/${r.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    start(async () => {
      const r = await deleteProduct(product.id);
      if (r.ok) router.push("/admin/products");
      else setMsg({ ok: false, text: r.error || "Erreur" });
    });
  }

  const move = (i: number, d: number) => {
    const a = [...f.images];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    set("images", a);
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 font-semibold">Prix & stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Prix (MAD)"><input type="number" min={0} className="input" value={f.price} onChange={(e) => set("price", e.target.value)} /></Field>
          <Field label="Ancien prix barré (MAD)" hint="Optionnel, affiche un -%"><input type="number" min={0} className="input" value={f.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} /></Field>
          <Field label="Stock"><input type="number" min={0} className="input" value={f.stock} onChange={(e) => set("stock", e.target.value)} /></Field>
          <Field label="Remise pour 2 unités (%)"><input type="number" min={0} max={90} className="input" value={f.disc_2} onChange={(e) => set("disc_2", e.target.value)} /></Field>
          <Field label="Remise pour 3 unités (%)"><input type="number" min={0} max={90} className="input" value={f.disc_3} onChange={(e) => set("disc_3", e.target.value)} /></Field>
          <Field label="Contenance"><input className="input" value={f.size} onChange={(e) => set("size", e.target.value)} placeholder="30 ml" /></Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-5 w-5 accent-[#1799b0]" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Visible dans la boutique</label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-5 w-5 accent-[#1799b0]" checked={f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Mis en avant</label>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 font-semibold">Photos</h2>
        <p className="mb-3 text-xs text-ink/50">La première image est l&apos;image principale. Format carré ou 4:5 recommandé.</p>
        <div className="flex flex-wrap gap-3">
          {f.images.map((u, i) => (
            <div key={u + i} className="w-28">
              <div className="aspect-square overflow-hidden rounded-xl bg-brand-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <button type="button" onClick={() => move(i, -1)} className="px-1.5 text-ink/60">←</button>
                <button type="button" onClick={() => set("images", f.images.filter((_, k) => k !== i))} className="text-red-600">Retirer</button>
                <button type="button" onClick={() => move(i, 1)} className="px-1.5 text-ink/60">→</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ImageUploader onUploaded={(urls) => set("images", [...f.images, ...urls])} />
          <span className="text-xs text-ink/50">ou collez une URL :</span>
          <input
            className="input !w-64 !py-2 text-sm"
            placeholder="https://…"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) {
                  set("images", [...f.images, v]);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {(["fr", "ar"] as const).map((l) => (
          <section key={l} className="rounded-2xl bg-white p-5 shadow-soft sm:p-6" dir={l === "ar" ? "rtl" : "ltr"}>
            <h2 className="mb-4 font-semibold">{l === "fr" ? "Contenu français" : "المحتوى بالعربية"}</h2>
            <div className="space-y-4">
              <Field label={l === "fr" ? "Nom" : "الاسم"}><input className="input" value={(f as any)[`name_${l}`]} onChange={(e) => set(`name_${l}` as keyof F, e.target.value)} /></Field>
              <Field label={l === "fr" ? "Accroche" : "جملة قصيرة"}><input className="input" value={(f as any)[`tagline_${l}`]} onChange={(e) => set(`tagline_${l}` as keyof F, e.target.value)} /></Field>
              <Field label={l === "fr" ? "Description" : "الوصف"}><textarea rows={4} className="input" value={(f as any)[`description_${l}`]} onChange={(e) => set(`description_${l}` as keyof F, e.target.value)} /></Field>
              <Field label={l === "fr" ? "Bénéfices (un par ligne)" : "الفوائد (واحدة في كل سطر)"}><textarea rows={4} className="input" value={(f as any)[`benefits_${l}`]} onChange={(e) => set(`benefits_${l}` as keyof F, e.target.value)} /></Field>
              <Field label={l === "fr" ? "Ingrédients" : "المكونات"}><textarea rows={3} className="input" value={(f as any)[`ingredients_${l}`]} onChange={(e) => set(`ingredients_${l}` as keyof F, e.target.value)} /></Field>
              <Field label={l === "fr" ? "Mode d'emploi" : "طريقة الاستعمال"}><textarea rows={3} className="input" value={(f as any)[`usage_${l}`]} onChange={(e) => set(`usage_${l}` as keyof F, e.target.value)} /></Field>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 font-semibold">Avancé</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Slug (URL)" hint={`/products/${f.slug || "…"}`}><input className="input" value={f.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
          <Field label="Catégorie"><input className="input" value={f.category} onChange={(e) => set("category", e.target.value)} /></Field>
          <Field label="Ordre d'affichage"><input type="number" className="input" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></Field>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-ink/10 bg-[#f6f4ef]/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <button onClick={save} disabled={pending} className="btn-primary !py-3">{pending ? "…" : isNew ? "Créer le produit" : "Enregistrer"}</button>
        {!isNew && <button onClick={remove} disabled={pending} className="rounded-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">Supprimer</button>}
        {msg && <span className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
