import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getReviews, getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { pick, tr } from "@/lib/tr";
import { faqs } from "@/lib/content";
import { essentialPct, essentialProducts, giftProduct } from "@/lib/offers";
import BundleOrderBox from "@/components/BundleOrderBox";
import ProductImage from "@/components/ProductImage";
import FaqList from "@/components/FaqList";
import Reviews from "@/components/Reviews";

export const metadata: Metadata = {
  title: "Pack Essentiel Rosa Alba",
  description: "Sérum, crème de nuit et masque Rosa Alba en pack, avec remise et un gel gommage offert. Livraison gratuite au Maroc, paiement à la livraison.",
  alternates: { canonical: "/pack-essentiel" },
  openGraph: { title: "Pack Essentiel Rosa Alba", description: "3 soins en pack avec remise et un gommage offert.", images: ["/og.jpg"] }
};

export default async function EssentialPackPage() {
  const lang = getLang();
  const [products, settings, reviews] = await Promise.all([getProducts(), getSettings(), getReviews()]);
  const list = essentialProducts(products);
  const gift = giftProduct(products, settings);
  const pct = essentialPct(settings);

  if (!settings.bundle2_enabled || list.length < 3) {
    return (
      <div className="container-x section text-center">
        <p>{tr(lang, "Ce pack n'est pas disponible pour le moment.", "هذا العرض غير متوفر حالياً.")}</p>
      </div>
    );
  }

  const steps = [
    tr(lang, "Matin & soir : sérum anti-âge", "صباحاً ومساءً: السيروم"),
    tr(lang, "Le soir : crème de nuit", "مساءً: كريم الليل"),
    tr(lang, "1–2 fois/semaine : masque éclat rose", "مرة إلى مرتين أسبوعياً: ماسك Éclat Rose")
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-cream">
        <div className="container-x grid gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-14">
          <div>
            <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink">
              {tr(lang, `Pack -${pct}%${gift ? " + cadeau" : ""}`, `باقة -${pct}%${gift ? " + هدية" : ""}`)}
            </span>
            <h1 className="h-display mt-4">{tr(lang, "Le Pack Essentiel Rosa Alba", "باقة Rosa Alba الأساسية")}</h1>
            <p className="mt-4 max-w-lg text-lg text-ink/70">
              {tr(
                lang,
                "Sérum, crème de nuit et masque : l'essentiel d'une routine éclat, avec un gel gommage offert. Livraison gratuite, paiement à la réception.",
                "سيروم وكريم ليلي وماسك: أساس روتين النضارة، مع مقشر الوجه هدية. توصيل مجاني والدفع عند الاستلام."
              )}
            </p>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[...list, ...(gift ? [gift] : [])].map((p) => (
                <div key={p.id}>
                  <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-soft"><ProductImage product={p} lang={lang} /></div>
                  <div className="mt-1.5 text-[11px] font-semibold leading-tight">
                    {pick(p, "name", lang) as string}
                    {gift && p.id === gift.id && <span className="ms-1 text-[#7a5d1c]">· {tr(lang, "offert", "هدية")}</span>}
                  </div>
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
            {settings.bundle_enabled && (
              <p className="mt-6 text-sm text-ink/65">
                {tr(lang, "Envie de tout ? ", "تريدين كل المنتجات؟ ")}
                <Link href="/routine" className="font-semibold text-brand-700 underline">{tr(lang, "Voir la routine complète", "شاهدي الروتين الكامل")}</Link>
              </p>
            )}
          </div>
          <div><BundleOrderBox kind="essential" products={products} settings={settings} /></div>
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
