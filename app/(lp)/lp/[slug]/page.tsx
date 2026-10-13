import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts, getReviews, getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { pick, tr } from "@/lib/tr";
import { fmt } from "@/lib/pricing";
import { faqs, INGREDIENTS } from "@/lib/content";
import Gallery from "@/components/Gallery";
import ProductOrderBox from "@/components/ProductOrderBox";
import StickyOrderBar from "@/components/StickyOrderBar";
import ViewContentTracker from "@/components/ViewContentTracker";
import FaqList from "@/components/FaqList";
import Reviews from "@/components/Reviews";
import LangToggle from "@/components/LangToggle";
import BundleTeaser from "@/components/BundleTeaser";
import { legalLinks } from "@/lib/legal";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  return p ? { title: `${p.name_fr} · Rosa Alba`, description: p.tagline_fr, robots: { index: false, follow: false }, alternates: { canonical: `/products/${p.slug}` } } : {};
}

/**
 * Ad landing page. Use ?v=1|2|3 in the ad URL to A/B test the headline, e.g.
 *   /lp/serum-anti-age?v=2&utm_source=meta&utm_campaign=serum_cbo
 */
export default async function LandingPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { v?: string };
}) {
  const lang = getLang();
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const [settings, reviews, all] = await Promise.all([getSettings(), getReviews(product.id), getProducts()]);

  const name = pick(product, "name", lang) as string;
  const benefits = pick(product, "benefits", lang) as string[];
  const v = ["1", "2", "3"].includes(searchParams.v || "") ? Number(searchParams.v) : 1;
  const hooks = {
    fr: [
      "Le secret beauté du Maroc, livré chez vous",
      "Offrez à votre peau la puissance des huiles précieuses du Maroc",
      "Une routine simple. Une peau qui rayonne."
    ],
    ar: [
      "سرّ الجمال المغربي يصلك حتى باب بيتك",
      "امنحي بشرتك قوة الزيوت المغربية الثمينة",
      "روتين بسيط. بشرة تشعّ نضارة."
    ]
  };
  const headline = hooks[lang][v - 1];
  const off =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
      : 0;

  return (
    <>
      <ViewContentTracker id={product.id} name={product.name_fr} price={Number(product.price)} />

      <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        {lang === "ar" ? settings.announcement_ar : settings.announcement_fr}
      </div>
      <header className="border-b border-ink/10 bg-cream">
        <div className="container-x flex h-14 items-center justify-between">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Rosa Alba" className="h-8 w-8" />
            <span className="font-serif text-xl font-bold tracking-wide">ROSA ALBA</span>
          </span>
          <LangToggle />
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-brand-50 to-cream">
        <div className="container-x grid gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-14">
          <div>
            <h1 className="font-serif text-4xl font-bold leading-[1.05] sm:text-5xl">{headline}</h1>
            <p className="mt-3 text-lg text-ink/70">
              <b>{name}</b> — {pick(product, "tagline", lang)}
            </p>
            <div className="mt-5">
              <Gallery product={product} lang={lang} />
            </div>
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold">{fmt(Number(product.price), lang)}</span>
              {off > 0 && (
                <>
                  <span className="text-lg text-ink/45 line-through">{fmt(Number(product.compare_at_price), lang)}</span>
                  <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">-{off}%</span>
                </>
              )}
            </div>
          </div>

          <div className="lg:pt-2">
            <ProductOrderBox product={product} settings={settings} heading={tr(lang, "Commandez maintenant", "اطلبي الآن")} />
            <div className="mt-4"><BundleTeaser products={all} settings={settings} lang={lang} /></div>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {[
                tr(lang, "🚚 Livraison gratuite", "🚚 توصيل مجاني"),
                tr(lang, "💵 Paiement à la livraison", "💵 الدفع عند الاستلام"),
                tr(lang, "🌿 Actifs naturels", "🌿 مكونات طبيعية"),
                tr(lang, `⚡ Livré en ${settings.delivery_days}`, `⚡ توصيل خلال ${settings.delivery_days}`)
              ].map((t) => (
                <li key={t} className="rounded-xl bg-white px-3 py-2.5 text-center font-medium shadow-soft">{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section">
        <div className="container-x max-w-3xl">
          <h2 className="h-section text-center">{tr(lang, "Pourquoi vous allez l'adorer", "لماذا ستعشقينه")}</h2>
          <p className="mt-4 text-center leading-relaxed text-ink/70">{pick(product, "description", lang)}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {benefits.map((b) => (
              <li key={b} className="card flex gap-3 p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs text-white">✓</span>
                <span className="text-sm font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* INGREDIENTS + USAGE */}
      <section className="section bg-brand-50">
        <div className="container-x grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="h-section">{tr(lang, "Ingrédients", "المكونات")}</h2>
            <p className="mt-3 leading-relaxed text-ink/75">{pick(product, "ingredients", lang)}</p>
            <div className="mt-5 grid gap-2.5">
              {INGREDIENTS(lang).slice(0, 4).map((i) => (
                <div key={i.n} className="rounded-xl bg-white p-3 text-sm shadow-soft">
                  <b className="text-brand-700">{i.n}</b> — {i.d}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="h-section">{tr(lang, "Mode d'emploi", "طريقة الاستعمال")}</h2>
            <p className="mt-3 leading-relaxed text-ink/75">{pick(product, "usage", lang)}</p>
          </div>
        </div>
      </section>

      <Reviews reviews={reviews} lang={lang} />

      <section className="section">
        <div className="container-x">
          <h2 className="h-section mb-8 text-center">{tr(lang, "Questions fréquentes", "أسئلة شائعة")}</h2>
          <FaqList items={faqs(lang, settings.delivery_days)} />
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x text-center">
          <a href="#order" className="btn-primary !px-10 text-base">
            {tr(lang, "Je commande maintenant", "أطلب الآن")}
          </a>
          <p className="mt-3 text-sm text-ink/60">{tr(lang, "Paiement à la livraison · Livraison gratuite", "الدفع عند الاستلام · توصيل مجاني")}</p>
        </div>
      </section>

      <footer className="pb-28 text-center text-xs text-ink/50 sm:pb-8">
        <div className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {legalLinks(lang).filter((l) => ["refund", "privacy", "terms", "contact"].includes(l.slug)).map((l) => (
            <a key={l.slug} href={`/legal/${l.slug}`} className="underline">{l.label}</a>
          ))}
        </div>
        © {new Date().getFullYear()} Rosa Alba
      </footer>
      <StickyOrderBar product={product} />
    </>
  );
}
