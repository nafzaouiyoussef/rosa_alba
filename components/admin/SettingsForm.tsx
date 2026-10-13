"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/types";
import { saveSettings } from "@/app/admin/actions";
import ImageUploader from "./ImageUploader";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveSettings(s);
      setMsg({ ok: r.ok, text: r.ok ? "Réglages enregistrés ✓" : r.error || "Erreur" });
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 font-semibold">Boutique</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Numéro WhatsApp" hint="Ex : 0612345678 ou +212612345678. Active le bouton WhatsApp flottant."><input className="input" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
          <Field label="Instagram (sans @)"><input className="input" value={s.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
          <Field label="Frais de livraison (MAD)" hint="0 = livraison gratuite"><input type="number" min={0} className="input" value={s.shipping_fee} onChange={(e) => set("shipping_fee", Number(e.target.value))} /></Field>
          <Field label="Délai de livraison affiché" hint="Ex : 24-72h"><input className="input" value={s.delivery_days} onChange={(e) => set("delivery_days", e.target.value)} /></Field>
          <Field label="Bandeau d'annonce (FR)"><input className="input" value={s.announcement_fr} onChange={(e) => set("announcement_fr", e.target.value)} /></Field>
          <Field label="Bandeau d'annonce (AR)"><input dir="rtl" className="input" value={s.announcement_ar} onChange={(e) => set("announcement_ar", e.target.value)} /></Field>
        </div>
        <div className="mt-4">
          <span className="label">Image principale de l&apos;accueil (optionnel)</span>
          <div className="flex flex-wrap items-center gap-3">
            {s.hero_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.hero_image} alt="" className="h-20 w-16 rounded-lg object-cover" />
            )}
            <ImageUploader multiple={false} label="Téléverser" onUploaded={(u) => set("hero_image", u[0])} />
            {s.hero_image && <button type="button" onClick={() => set("hero_image", "")} className="text-sm text-red-600">Retirer</button>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-1 font-semibold">Informations légales &amp; contact</h2>
        <p className="mb-4 text-xs text-ink/55">Affichées sur les pages Contact, Mentions et politiques (utile pour la vérification Meta / TikTok / Google).</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de la société / marque"><input className="input" value={s.business_name} onChange={(e) => set("business_name", e.target.value)} /></Field>
          <Field label="Email de contact"><input type="email" className="input" value={s.contact_email} onChange={(e) => set("contact_email", e.target.value)} /></Field>
          <Field label="Adresse"><input className="input" value={s.business_address} onChange={(e) => set("business_address", e.target.value)} /></Field>
          <Field label="ICE / RC (si vous en avez)"><input className="input" value={s.business_id} onChange={(e) => set("business_id", e.target.value)} /></Field>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-1 font-semibold">Pixels de tracking</h2>
        <p className="mb-4 text-xs text-ink/55">
          Collez uniquement l&apos;ID (pas le code). Événements envoyés : ViewContent, AddToCart, InitiateCheckout, Purchase (page de remerciement).
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Meta Pixel ID" hint="Ex : 123456789012345"><input className="input" value={s.meta_pixel_id} onChange={(e) => set("meta_pixel_id", e.target.value)} /></Field>
          <Field label="TikTok Pixel ID" hint="Ex : C1A2B3D4E5F6"><input className="input" value={s.tiktok_pixel_id} onChange={(e) => set("tiktok_pixel_id", e.target.value)} /></Field>
          <Field label="Google Analytics 4 ID" hint="Ex : G-XXXXXXXXXX"><input className="input" value={s.ga_id} onChange={(e) => set("ga_id", e.target.value)} /></Field>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-4 font-semibold">Upsell sur la page de remerciement</h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="h-5 w-5 accent-[#1799b0]" checked={s.upsell_enabled} onChange={(e) => set("upsell_enabled", e.target.checked)} />
          Proposer un produit supplémentaire à prix réduit après la commande
        </label>
        <div className="mt-4 max-w-xs">
          <Field label="Remise pack Routine complète (%)"><input type="number" min={0} max={50} className="input" value={s.bundle_discount_pct} onChange={(e) => set("bundle_discount_pct", Number(e.target.value))} /></Field>
          <Field label="Remise upsell (%)"><input type="number" min={0} max={50} className="input" value={s.upsell_discount_pct} onChange={(e) => set("upsell_discount_pct", Number(e.target.value))} /></Field>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-primary !py-3">{pending ? "…" : "Enregistrer"}</button>
        {msg && <span className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
