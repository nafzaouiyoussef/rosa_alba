"use client";

import type { Product } from "@/lib/types";
import { pick, tr } from "@/lib/tr";
import { trackAddToCart } from "@/lib/track";
import { useCart, useLang } from "./Providers";

export default function AddToCartButton({ product, className = "" }: { product: Product; className?: string }) {
  const lang = useLang();
  const cart = useCart();
  return (
    <button
      type="button"
      disabled={product.stock <= 0}
      onClick={() => {
        cart.add(product, 1);
        trackAddToCart({ id: product.id, name: pick(product, "name", lang), price: Number(product.price), qty: 1 });
      }}
      className={`btn-primary !py-3 text-sm ${className}`}
    >
      {product.stock <= 0 ? tr(lang, "Épuisé", "نفد") : tr(lang, "Ajouter", "أضيفي")}
    </button>
  );
}
