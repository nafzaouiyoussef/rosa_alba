"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { fmt } from "@/lib/pricing";
import { pick, tr } from "@/lib/tr";
import { useLang } from "./Providers";

/** Mobile sticky add-to-cart bar: hidden while the order box is on screen. */
export default function StickyOrderBar({ product }: { product: Product }) {
  const lang = useLang();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const el = document.getElementById("order");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!show || product.stock <= 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,42,51,0.12)] backdrop-blur sm:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{pick(product, "name", lang)}</div>
          <div className="text-base font-bold">{fmt(Number(product.price), lang)}</div>
        </div>
        <a href="#order" className="btn-primary shine relative overflow-hidden !px-6 !py-3 text-sm">
          {tr(lang, "Commander", "اطلبي الآن")}
        </a>
      </div>
    </div>
  );
}
