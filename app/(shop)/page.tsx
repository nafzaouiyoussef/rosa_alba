import Link from "next/link";
import { getProducts, getReviews, getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { tr } from "@/lib/tr";
import { faqs, INGREDIENTS, PILLARS } from "@/lib/content";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import FaqList from "@/components/FaqList";
import Reviews from "@/components/Reviews";
import BundleTeaser from "@/components/BundleTeaser";

export default async function Home() {
  const lang = getLang();
  const [products, settings, reviews] = await Promise.all([getProducts(), getSettings(), getReviews()]);
  const trust = [
    { i: "🚚", t: tr(lang, "Livraison gratuite", "توصيل مجاني"), d: tr(lang, "Partout au Maroc", "لجميع المدن") },
    { i: "💵", t: tr(lang, "Paiement à la livraison", "الدفع عند الاستلام"), d: tr(lang, "Payez à la réception", "ادفعي عند وصول الطلب") },
    { i: "🌿", t: tr(lang, "Actifs naturels", "مكونات طبيعية"), d: tr(lang, "Argan, figue de Barbarie…", "أركان، تين شوكي…") },
    { i: "⚡", t: tr(lang, `Livré en ${settings.delivery_days}`, `توصيل خلال ${settings.delivery_days}`), d: tr(lang, "Après confirmation", "بعد تأكيد الطلب") }
  ];
  const steps = [
    { n: "1", t: tr(lang, "Choisissez vos soins", "اختاري منتجاتك"), d: tr(lang, "Remplissez le formulaire en 30 secondes.", "املئي الاستمارة في 30 ثانية.") },
    { n: "2", t: tr(lang, "Nous vous appelons", "نتصل بك"), d: tr(lang, "Un appel rapide pour confirmer votre commande.", "مكالمة سريعة لتأكيد طلبك.") },
    { n: "3", t: tr(lang, "Payez à la réception", "ادفعي عند الاستلام"), d: tr(lang, "Livraison gratuite chez vous, paiement en espèces.", "توصيل مجاني إلى باب بيتك والدفع نقداً.") }
  ];

  return (
    <>
      {/* HERO — "aqua pearl": bright water-light background, product in an arch with ripples */}
      <section className="relative mx-3 mt-2 overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#e9fbfc] via-[#c9f4f6] to-[#aeeaee] sm:mx-6 sm:rounded-[3rem]">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(40rem 26rem at 85% 30%, rgba(255,255,255,.95), transparent 60%), radial-gradient(30rem 20rem at 5% 90%, rgba(255,255,255,.7), transparent 60%)" }} />
        <div className="container-x relative grid items-center gap-8 pb-12 pt-12 md:grid-cols-[1.05fr_1fr] md:gap-4 md:pb-20 md:pt-16">
          <div className="rise order-2 md:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-800 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              {tr(lang, "Soins naturels · Maroc", "عناية طبيعية · المغرب")}
            </span>
            <h1 className="h-display mt-6 text-ink">
              {tr(lang, "Une peau fraîche", "بشرة منتعشة")}{" "}
              <span className="font-lux block pb-2 text-[1.15em] text-brand-700">
                {tr(lang, "comme l'eau claire.", "كالماء الصافي.")}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/70">
              {tr(
                lang,
                "Sérum, crème de nuit, masque, huile sèche et gommage : une routine complète à l'argan et à la figue de Barbarie, livrée chez vous.",
                "سيروم، كريم ليلي، ماسك، زيت جاف ومقشر: روتين متكامل بزيت الأركان والتين الشوكي يصلك حتى باب بيتك."
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {settings.bundle_enabled ? (
                <Link href="/routine" className="btn-primary text-base">
                  {tr(lang, `Routine complète −${settings.bundle_discount_pct}%`, `الروتين الكامل −${settings.bundle_discount_pct}%`)} →
                </Link>
              ) : (
                <Link href="#produits" className="btn-primary text-base">{tr(lang, "Découvrir les soins", "اكتشفي المنتجات")}</Link>
              )}
              <Link href="#produits" className="btn-ghost">{tr(lang, "Voir les produits", "شاهدي المنتجات")}</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink/70">
              {[
                tr(lang, "Livraison gratuite", "توصيل مجاني"),
                tr(lang, "Paiement à la livraison", "الدفع عند الاستلام"),
                tr(lang, "100 % naturel", "طبيعي 100%")
              ].map((t) => (
                <li key={t} className="flex items-center gap-2"><span className="text-brand-600">✓</span>{t}</li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 mx-auto flex w-full max-w-md items-end justify-center md:order-2">
            {/* water ripples */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 aspect-square">
              {[0, 1, 2].map((i) => (
                <span key={i} className="ripple absolute inset-[10%] rounded-full border border-white/90" style={{ animationDelay: `${i * 1.6}s` }} />
              ))}
            </div>
            {settings.hero_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.hero_image} alt="Rosa Alba" className="relative aspect-[4/5] w-[78%] rounded-t-full rounded-b-[2rem] object-cover shadow-[0_40px_80px_-30px_rgba(23,123,144,0.7)]" />
            ) : (
              <div className="relative w-[78%]">
                <div className="aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] border-[6px] border-white/80 shadow-[0_40px_80px_-30px_rgba(23,123,144,0.7)]">
                  {(products.find((p) => p.slug === "masque-eclat-rose") || products[0]) && (
                    <ProductImage product={(products.find((p) => p.slug === "masque-eclat-rose") || products[0])} lang={lang} priority />
                  )}
                </div>
                <div className="float absolute -start-6 top-[18%] flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold shadow-soft backdrop-blur [--r:-3deg]">
                  <span className="text-gold">★★★★★</span> {tr(lang, "100% naturel", "طبيعي 100%")}
                </div>
                {products[0] && (
                  <Link href={`/products/${products[0].slug}`} className="float absolute -end-4 bottom-[10%] block w-[34%] overflow-hidden rounded-2xl border-4 border-white shadow-soft [--r:4deg] [animation-delay:-3s]">
                    <div className="aspect-[3/4]"><ProductImage product={products[0]} lang={lang} /></div>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ticker */}
        <div className="relative overflow-hidden border-t border-white/70 py-4" aria-hidden="true">
          <div className="marquee gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.3em] text-brand-800/60">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 gap-10 pe-10">
                {["Argan", "Figue de Barbarie", "Macadamia", "Amande douce", "Aloe vera", "Rose", "Vitamine E", "100% naturel"].map((t) => (
                  <span key={t + k} className="flex items-center gap-10">{t}<span className="text-brand-500">✦</span></span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="container-x -mt-1 pt-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {trust.map((x) => (
            <div key={x.t} className="card reveal flex items-center gap-3 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-200 to-white text-xl shadow-inner">{x.i}</span>
              <div className="leading-tight">
                <div className="text-sm font-bold">{x.t}</div>
                <div className="text-xs text-ink/55">{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="produits" className="section scroll-mt-20">
        <div className="container-x">
          <div className="mb-8 text-center">
            <h2 className="h-section">{tr(lang, "Nos soins signature", "منتجاتنا")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/65">
              {tr(lang, "Chaque produit est livré gratuitement et payable à la réception.", "كل المنتجات توصَّل مجاناً والدفع عند الاستلام.")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="reveal"><ProductCard product={p} lang={lang} /></div>
            ))}
          </div>
          <div className="mt-8"><BundleTeaser products={products} settings={settings} lang={lang} /></div>
        </div>
      </section>

      {/* ROUTINE / PHOTO STRIP */}
      <section className="section">
        <div className="container-x">
          <div className="mb-8 text-center">
            <h2 className="h-section">{tr(lang, "La routine complète", "الروتين الكامل")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/65">
              {tr(lang, "Nettoyez, exfoliez, illuminez, nourrissez : 5 gestes, 5 soins naturels.", "نظّفي، قشّري، أشرقي، غذّي: 5 خطوات و5 منتجات طبيعية.")}
            </p>
          </div>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
            {products.map((p, i) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group w-40 shrink-0 snap-start sm:w-auto">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-soft">
                  <ProductImage product={p} lang={lang} className="transition duration-500 group-hover:scale-105" />
                </div>
                <div className="mt-2 text-xs font-semibold text-brand-700">{String(i + 1).padStart(2, "0")}</div>
                <div className="text-sm font-semibold leading-tight">{tr(lang, p.name_fr, p.name_ar)}</div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="https://www.instagram.com/rosaal_ba" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              {tr(lang, "Suivez-nous @rosaal_ba", "تابعينا @rosaal_ba")}
            </a>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="relative mx-3 overflow-hidden rounded-[2rem] bg-[#04141a] py-16 text-white sm:mx-6 sm:rounded-[3rem] sm:py-24">
        <div className="orb -top-10 start-10 h-60 w-60 bg-brand-400/40" />
        <div className="orb bottom-0 end-10 h-60 w-60 bg-[#1799b0]/35 [animation-delay:-6s]" />
        <div className="container-x relative">
          <h2 className="h-section text-center">{tr(lang, "Pourquoi Rosa Alba ?", "لماذا Rosa Alba؟")}</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PILLARS(lang).map((p, i) => (
              <div key={p.t} className="glass-dark reveal p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl neon-ring">{p.icon}</div>
                <div className="mt-5 font-serif text-sm font-bold tracking-widest text-brand-300">0{i + 1}</div>
                <h3 className="mt-1 font-serif text-2xl font-bold">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INGREDIENTS */}
      <section id="ingredients" className="section scroll-mt-20">
        <div className="container-x">
          <h2 className="h-section text-center">{tr(lang, "Des ingrédients qui font la différence", "مكونات تصنع الفرق")}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INGREDIENTS(lang).map((i) => (
              <div key={i.n} className="card reveal p-5 transition hover:-translate-y-1">
                <div className="text-aurora font-serif text-xl font-extrabold">{i.n}</div>
                <p className="mt-1.5 text-sm text-ink/70">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO ORDER */}
      <section id="commande" className="section scroll-mt-20">
        <div className="container-x">
          <h2 className="h-section text-center">{tr(lang, "Commander, c'est simple", "الطلب سهل جداً")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="card reveal p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-[#1799b0] font-serif text-2xl font-extrabold text-white shadow-[0_10px_30px_-8px_rgba(31,191,208,0.6)]">{s.n}</div>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-ink/65">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reviews reviews={reviews} lang={lang} />

      {/* FAQ */}
      <section id="faq" className="section scroll-mt-20">
        <div className="container-x">
          <h2 className="h-section mb-8 text-center">{tr(lang, "Questions fréquentes", "أسئلة شائعة")}</h2>
          <FaqList items={faqs(lang, settings.delivery_days)} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f2a33] via-[#177b90] to-[#45dde0] px-6 py-14 text-center text-white shadow-[0_30px_70px_-20px_rgba(31,191,208,0.6)]">
            <h2 className="font-serif text-3xl font-extrabold sm:text-5xl">
              {tr(lang, "Votre routine Rosa Alba vous attend", "روتين Rosa Alba في انتظارك")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/90">
              {tr(lang, "Livraison gratuite · Paiement à la livraison", "توصيل مجاني · الدفع عند الاستلام")}
            </p>
            <Link href="#produits" className="btn mt-6 bg-white text-ink hover:bg-cream">
              {tr(lang, "Choisir mes soins", "اختاري منتجاتك")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
