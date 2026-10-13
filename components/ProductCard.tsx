import Link from "next/link";
import type { Lang, Product } from "@/lib/types";
import { fmt } from "@/lib/pricing";
import { pick, tr } from "@/lib/tr";
import ProductImage from "./ProductImage";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product, lang }: { product: Product; lang: Lang }) {
  const off =
    product.compare_at_price && Number(product.compare_at_price) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
      : 0;
  return (
    <div className="card group flex flex-col overflow-hidden transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-20px_rgba(31,191,208,0.55)]">
      <Link href={`/products/${product.slug}`} className="relative m-2 block aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-brand-50">
        <div className="h-full w-full transition duration-500 group-hover:scale-105">
          <ProductImage product={product} lang={lang} />
        </div>
        {off > 0 && (
          <span className="absolute start-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-ink backdrop-blur">-{off}%</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="font-serif text-lg font-bold leading-tight hover:text-brand-700">
          {pick(product, "name", lang)}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">{pick(product, "tagline", lang)}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <div className="text-lg font-bold">{fmt(Number(product.price), lang)}</div>
            {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
              <div className="text-xs text-ink/45 line-through">{fmt(Number(product.compare_at_price), lang)}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/products/${product.slug}#order`} className="btn-brand !px-4 !py-3 text-sm">
              {tr(lang, "Commander", "اطلبي")}
            </Link>
            <AddToCartButton product={product} className="!px-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
