import Link from "next/link";
import type { Lang, Product, Settings } from "@/lib/types";
import { fmt, lineTotal } from "@/lib/pricing";
import { tr } from "@/lib/tr";
import ProductImage from "./ProductImage";

/** Compact promo card linking to /routine. Hidden when the bundle is disabled. */
export default function BundleTeaser({ products, settings, lang }: { products: Product[]; settings: Settings; lang: Lang }) {
  if (!settings.bundle_enabled || products.length < 2) return null;
  const pct = Math.max(0, Math.min(50, Number(settings.bundle_discount_pct) || 0));
  const total = products.reduce((s, p) => s + lineTotal(p, 1, pct), 0);
  return (
    <Link
      href="/routine"
      className="group block overflow-hidden rounded-3xl bg-gradient-to-br from-ink to-brand-900 p-5 text-white shadow-soft sm:p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex -space-x-5 rtl:space-x-reverse">
          {products.slice(0, 4).map((p) => (
            <span key={p.id} className="h-16 w-14 overflow-hidden rounded-xl border-2 border-ink shadow-soft">
              <ProductImage product={p} lang={lang} />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-ink">-{pct}%</span>
          <div className="mt-1 font-serif text-xl font-bold leading-tight">
            {tr(lang, "La routine complète", "الروتين الكامل")}
          </div>
          <div className="text-sm text-white/75">
            {tr(lang, `${products.length} soins · ${fmt(total, lang)} · livraison gratuite`, `${products.length} منتجات · ${fmt(total, lang)} · توصيل مجاني`)}
          </div>
        </div>
        <span className="text-2xl transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
      </div>
    </Link>
  );
}
