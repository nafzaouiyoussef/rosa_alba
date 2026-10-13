import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getReviews, getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { pick, tr } from "@/lib/tr";
import { fmt } from "@/lib/pricing";
import { faqs } from "@/lib/content";
import Gallery from "@/components/Gallery";
import ProductOrderBox from "@/components/ProductOrderBox";
import StickyOrderBar from "@/components/StickyOrderBar";
import ViewContentTracker from "@/components/ViewContentTracker";
import FaqList from "@/components/FaqList";
import Reviews from "@/components/Reviews";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { abs, breadcrumbLd, clip, productLd } from "@/lib/seo";
import BundleTeaser from "@/components/BundleTeaser";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return {};
  const title = `${p.name_fr}${p.size ? ` ${p.size}` : ""} — Livraison gratuite au Maroc`;
  const description = clip(`${p.tagline_fr}. ${p.description_fr}`);
  const images = (p.images?.length ? p.images : ["/og.jpg"]).slice(0, 3).map((i) => ({ url: abs(i), alt: p.name_fr }));
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { type: "website", url: abs(`/products/${p.slug}`), title: `${p.name_fr} · Rosa Alba`, description, images },
    twitter: { card: "summary_large_image", title: `${p.name_fr} · Rosa Alba`, description, images: images.map((i) => i.url) }
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const lang = getLang();
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const [settings, reviews, all] = await Promise.all([getSettings(), getReviews(product.id), getProducts()]);
  const name = pick(product, "name", lang) as string;
  const benefits = pick(product, "benefits", lang) as string[];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const off =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
      : 0;
  const related = all.filter((p) => p.id !== product.id).slice(0, 3);

  const jsonLd = [
    productLd(product, settings, reviews.length ? { avg, count: reviews.length } : undefined),
    breadcrumbLd([
      { name: "Accueil", path: "/" },
      { name: "Produits", path: "/#produits" },
      { name: product.name_fr, path: `/products/${product.slug}` }
    ])
  ];

  return (
    <>
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <ViewContentTracker id={product.id} name={product.name_fr} price={Number(product.price)} />

      <div className="container-x pb-10 pt-6 sm:pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Gallery product={product} lang={lang} />
          </div>

          <div>
            {product.size && (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{product.size}</span>
            )}
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">{name}</h1>
            <p className="mt-2 text-lg text-ink/70">{pick(product, "tagline", lang)}</p>

            {reviews.length > 0 && (
              <a href="#avis" className="mt-3 inline-flex items-center gap-2 text-sm">
                <Stars value={avg} /> <span className="font-semibold">{avg.toFixed(1)}</span>
                <span className="text-ink/55 underline">({reviews.length} {tr(lang, "avis", "تقييم")})</span>
              </a>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{fmt(Number(product.price), lang)}</span>
              {off > 0 && (
                <>
                  <span className="text-lg text-ink/45 line-through">{fmt(Number(product.compare_at_price), lang)}</span>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">-{off}%</span>
                </>
              )}
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-2 text-sm">
              {[
                ["🚚", tr(lang, "Livraison gratuite", "توصيل مجاني")],
                ["💵", tr(lang, "Paiement à la livraison", "الدفع عند الاستلام")],
                ["🌿", tr(lang, "Actifs naturels", "مكونات طبيعية")],
                ["⚡", tr(lang, `Livré en ${settings.delivery_days}`, `توصيل خلال ${settings.delivery_days}`)]
              ].map(([i, t]) => (
                <li key={t} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 shadow-soft">
                  <span>{i}</span>
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 leading-relaxed text-ink/75">{pick(product, "description", lang)}</p>

            {benefits?.length > 0 && (
              <ul className="mt-5 space-y-2.5">
                {benefits.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs text-white">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <ProductOrderBox product={product} settings={settings} />
            </div>

            <div className="mt-5"><BundleTeaser products={all} settings={settings} lang={lang} /></div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold sm:text-xs">
              {[
                ["📞", tr(lang, "Confirmation par appel", "تأكيد عبر مكالمة")],
                ["📦", tr(lang, "Vérifiez avant de payer", "عاينيه قبل الدفع")],
                ["🔁", tr(lang, "Échange si problème", "استبدال عند المشكل")]
              ].map(([i, t]) => (
                <div key={t} className="rounded-xl bg-white px-2 py-3 shadow-soft"><div className="text-lg">{i}</div>{t}</div>
              ))}
            </div>

            <div className="mt-8 divide-y divide-ink/10 rounded-2xl bg-white shadow-soft">
              <details className="group p-5" open>
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {tr(lang, "Ingrédients", "المكونات")} <span className="text-xl text-brand-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{pick(product, "ingredients", lang)}</p>
              </details>
              <details className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {tr(lang, "Mode d'emploi", "طريقة الاستعمال")} <span className="text-xl text-brand-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{pick(product, "usage", lang)}</p>
              </details>
              <details className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {tr(lang, "Livraison & paiement", "التوصيل والدفع")} <span className="text-xl text-brand-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {tr(
                    lang,
                    `Livraison gratuite dans tout le Maroc, en général sous ${settings.delivery_days} après confirmation téléphonique. Vous payez en espèces au livreur.`,
                    `توصيل مجاني لجميع مدن المغرب، عادةً خلال ${settings.delivery_days} بعد التأكيد عبر الهاتف. الدفع نقداً للموزع عند الاستلام.`
                  )}
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>

      <div id="avis" className="scroll-mt-24">
        <Reviews reviews={reviews} lang={lang} />
      </div>

      <section className="section">
        <div className="container-x">
          <h2 className="h-section mb-8 text-center">{tr(lang, "Questions fréquentes", "أسئلة شائعة")}</h2>
          <FaqList items={faqs(lang, settings.delivery_days)} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="section pt-0">
          <div className="container-x">
            <h2 className="h-section mb-8 text-center">{tr(lang, "Complétez votre routine", "أكملي روتينك")}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      <StickyOrderBar product={product} />
    </>
  );
}
