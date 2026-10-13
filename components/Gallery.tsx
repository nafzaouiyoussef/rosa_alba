"use client";

import { useRef, useState } from "react";
import type { Lang, Product } from "@/lib/types";
import ProductImage from "./ProductImage";

/** Swipeable gallery (scroll-snap) with dots. Falls back to one branded placeholder slide. */
export default function Gallery({ product, lang }: { product: Product; lang: Lang }) {
  const imgs = product.images?.length ? product.images : [""];
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  const go = (n: number) => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: (el.dir === "rtl" || document.documentElement.dir === "rtl" ? -1 : 1) * w * n, behavior: "smooth" });
    setI(n);
  };

  return (
    <div>
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setI(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-brand-50"
      >
        {imgs.map((src, idx) => (
          <div key={idx} className="aspect-[4/5] w-full shrink-0 snap-center sm:aspect-square">
            <ProductImage product={product} lang={lang} src={src || undefined} priority={idx === 0} />
          </div>
        ))}
      </div>
      {imgs.length > 1 && (
        <>
          <div className="mt-3 flex justify-center gap-1.5">
            {imgs.map((_, idx) => (
              <button key={idx} aria-label={`Image ${idx + 1}`} onClick={() => go(idx)} className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-ink" : "w-2 bg-ink/25"}`} />
            ))}
          </div>
          <div className="mt-3 hidden gap-2 sm:flex">
            {imgs.map((src, idx) => (
              <button key={idx} onClick={() => go(idx)} className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${idx === i ? "border-ink" : "border-transparent"}`}>
                <ProductImage product={product} lang={lang} src={src || undefined} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
