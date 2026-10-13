/* eslint-disable @next/next/no-img-element */
import type { Lang, Product } from "@/lib/types";
import { pick } from "@/lib/tr";

/**
 * Shows the product photo, or a branded placeholder (turquoise label look)
 * until real photos are uploaded from Admin > Produits.
 */
export default function ProductImage({
  product,
  lang,
  src,
  className = "",
  priority = false
}: {
  product: Product;
  lang: Lang;
  src?: string;
  className?: string;
  priority?: boolean;
}) {
  const url = src ?? product.images?.[0];
  if (url) {
    return (
      <img
        src={url}
        alt={pick(product, "name", lang)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-sand ${className}`}>
      <div className="mx-6 flex w-2/3 max-w-[220px] flex-col items-center rounded-3xl bg-brand-400/90 px-4 py-8 text-center shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-10 w-10" />
        <div className="mt-3 font-serif text-lg font-bold tracking-widest text-ink">ROSA ALBA</div>
        <div className="mt-2 text-[11px] font-semibold uppercase leading-snug tracking-wider text-ink/80">
          {pick(product, "name", lang)}
        </div>
        {product.size && <div className="mt-2 text-[10px] text-ink/60">{product.size}</div>}
      </div>
    </div>
  );
}
