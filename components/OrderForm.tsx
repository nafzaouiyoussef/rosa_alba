"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, normalizePhone } from "@/lib/cities";
import { tr } from "@/lib/tr";
import { fmt } from "@/lib/pricing";
import { trackInitiateCheckout } from "@/lib/track";
import { readUtm } from "./UtmCapture";
import { useLang } from "./Providers";

type Props = {
  items: { product_id: string; qty: number; name: string; price: number }[];
  total: number;
  shipping: number;
  onSuccess?: () => void;
  ctaLabel?: string;
  bundle?: boolean;
};

export default function OrderForm({ items, total, shipping, onSuccess, ctaLabel, bundle }: Props) {
  const lang = useLang();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(false);

  const onFirstTouch = () => {
    if (started.current || !items.length) return;
    started.current = true;
    trackInitiateCheckout(
      items.map((i) => ({ id: i.product_id, name: i.name, price: i.price, qty: i.qty })),
      total
    );
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phoneRaw = String(f.get("phone") || "");
    const city = String(f.get("city") || "");
    const address = String(f.get("address") || "").trim();
    const notes = String(f.get("notes") || "").trim();

    if (name.length < 3) return setError(tr(lang, "Veuillez saisir votre nom complet.", "المرجو إدخال الاسم الكامل."));
    const phone = normalizePhone(phoneRaw);
    if (!phone)
      return setError(
        tr(lang, "Numéro invalide. Exemple : 06 12 34 56 78", "رقم الهاتف غير صحيح. مثال: 06 12 34 56 78")
      );
    if (!city) return setError(tr(lang, "Veuillez choisir votre ville.", "المرجو اختيار المدينة."));
    if (address.length < 6) return setError(tr(lang, "Veuillez saisir votre adresse.", "المرجو إدخال العنوان."));

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
          bundle: bundle === true,
          name,
          phone,
          city,
          address,
          notes,
          lang,
          source: window.location.pathname,
          utm: readUtm(),
          hp: String(f.get("website") || "")
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "error");
      onSuccess?.();
      router.push(`/thank-you/${data.order_number}?t=${data.token}`);
    } catch (err: any) {
      setBusy(false);
      setError(
        err?.message && err.message !== "error"
          ? err.message
          : tr(lang, "Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.", "حدث خطأ. أعيدي المحاولة أو تواصلي معنا عبر واتساب.")
      );
    }
  }

  return (
    <form onSubmit={submit} onFocus={onFirstTouch} className="space-y-3.5" noValidate>
      <div>
        <label className="label" htmlFor="name">{tr(lang, "Nom complet", "الاسم الكامل")}</label>
        <input id="name" name="name" className="input" autoComplete="name" placeholder={tr(lang, "Ex : Salma Benali", "مثال: سلمى بنعلي")} />
      </div>
      <div>
        <label className="label" htmlFor="phone">{tr(lang, "Téléphone (WhatsApp)", "رقم الهاتف (واتساب)")}</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" dir="ltr" className="input text-start" autoComplete="tel" placeholder="06 12 34 56 78" />
      </div>
      <div>
        <label className="label" htmlFor="city">{tr(lang, "Ville", "المدينة")}</label>
        <select id="city" name="city" className="input" defaultValue="">
          <option value="" disabled>{tr(lang, "Choisir votre ville", "اختاري مدينتك")}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="address">{tr(lang, "Adresse complète", "العنوان الكامل")}</label>
        <textarea id="address" name="address" rows={2} className="input" autoComplete="street-address" placeholder={tr(lang, "Quartier, rue, n° d'immeuble…", "الحي، الشارع، رقم العمارة…")} />
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-ink/60">{tr(lang, "Ajouter une note (optionnel)", "إضافة ملاحظة (اختياري)")}</summary>
        <textarea name="notes" rows={2} className="input mt-2" />
      </details>

      {/* honeypot: bots fill it, humans never see it */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="rounded-2xl bg-brand-50 p-4 text-sm">
        <div className="flex justify-between"><span>{tr(lang, "Sous-total", "المجموع")}</span><span>{fmt(total, lang)}</span></div>
        <div className="mt-1 flex justify-between">
          <span>{tr(lang, "Livraison", "التوصيل")}</span>
          <span className="font-semibold text-brand-700">{shipping > 0 ? fmt(shipping, lang) : tr(lang, "GRATUITE", "مجاني")}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-brand-200 pt-2 text-base font-bold">
          <span>{tr(lang, "Total à payer à la livraison", "المبلغ عند الاستلام")}</span>
          <span>{fmt(total + shipping, lang)}</span>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <button type="submit" disabled={busy || !items.length} className="btn-primary w-full text-base">
        {busy
          ? tr(lang, "Envoi en cours…", "جاري الإرسال…")
          : ctaLabel || tr(lang, "Commander — Paiement à la livraison", "اطلبي الآن — الدفع عند الاستلام")}
      </button>
      <p className="text-center text-xs text-ink/55">
        {tr(lang, "🔒 Aucun paiement en ligne. Nous vous appelons pour confirmer.", "🔒 لا يوجد دفع عبر الإنترنت. سنتصل بك لتأكيد الطلب.")}
      </p>
    </form>
  );
}
