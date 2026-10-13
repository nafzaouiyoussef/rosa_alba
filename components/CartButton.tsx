"use client";

import Link from "next/link";
import { useCart, useLang } from "./Providers";

export default function CartButton() {
  const { count, ready } = useCart();
  const lang = useLang();
  return (
    <Link
      href="/checkout"
      aria-label={lang === "ar" ? "السلة" : "Panier"}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 hover:border-ink/50"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12l-1 12H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
