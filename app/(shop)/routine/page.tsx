import type { Metadata } from "next";
import { getProducts, getReviews, getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { pick, tr } from "@/lib/tr";
import { faqs } from "@/lib/content";
import BundleOrderBox from "@/components/BundleOrderBox";
import ProductImage from "@/components/ProductImage";
import FaqList from "@/components/FaqList";
import Reviews from "@/components/Reviews";

export const metadata: Metadata = {
  title: "Routine complète Rosa Alba",
  description: "Les 5 soins Rosa Alba en un pack, avec remise. Livraison gratuite partout au Maroc, paiement à la livraison.",
  alternates: { canonical: "/routine" },
  openGraph: { title: "Routine complète Rosa Alba", description: "Les 5 soins Rosa Alba en un pack, avec remise.", images: ["/og.jpg"] }
};

export default async function RoutinePage() {
  const lang = getLang();
  const [products, settings, reviews] = await Promise.all([getProducts(), getSettings(), getReviews()]);
  const pct = Number(settings.bundle_discount_pct) || 0;

  if (!settings.bundle_enabled || products.length < 2) {
    return (
      <div className="container-x section text-center">
        <p>{tr(lang, "Ce pack n'est pas disponible pour le moment.", "هذا العرض غير متوفر حالياً.")}</p>
      </div>
    );
  }

  const steps = [
    tr(lang, "Matin & soir : sérum anti-âge", "صباحاً ومساءً: السيروم"),
    tr(lang, "Le soir : crème de nuit", "مساءً: كريم الليل"),
    tr(lang, "1–2 fois/semaine : gommage puis masque", "مرة إلى مرتين أسبوعياً: المقشر ثم الماسك"),
    tr(lang, "Corps : huile sèche Moukhalat", "للجسم: زيت Moukhalat الجاف")
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-cream">
        <div className="container-x grid gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-14">
          <div>
            <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink">
              {tr(lang, `Pack exclusif -${pct}%`, `عرض حصري -${pct}%`)}
            </span>
            <h1 className="h-display mt-4">{tr(lang, "La routine complète Rosa Alba", "روتين Rosa Alba الكامل")}</h1>
            <p className="mt-4 max-w-lg text-lg text-ink/70">
              {tr(
                lang,
                "Tous nos soins naturels à l'argan et à la figue de Barbarie, réunis dans un seul pack. Livraison gratuite, paiement à la réception.",
                "كل منتجاتنا الطبيعية بزيت الأركان والتين الشوكي في عرض واحد. توصيل مجاني والدفع عند الاستلام."
              )}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {products.map((p) => (
                <div key={p.id}>
                  <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-soft"><ProductImage product={p} lang={lang} /></div>
                  <div className="mt-1.5 text-[11px] font-semibold leading-tight">{pick(p, "name", lang) as string}</div>
                </div>
              ))}
            </div>
            <ol className="mt-6 space-y-2 text-sm text-ink/75">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div><BundleOrderBox products={products} settings={settings} /></div>
        </div>
      </section>

      <Reviews reviews={reviews} lang={lang} />

      <section className="section">
        <div className="container-x">
          <h2 className="h-section mb-8 text-center">{tr(lang, "Questions fréquentes", "أسئلة شائعة")}</h2>
          <FaqList items={faqs(lang, settings.delivery_days)} />
        </div>
      </section>
    </>
  );
}
