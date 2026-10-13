import Link from "next/link";
import type { Lang, Settings } from "@/lib/types";
import { tr } from "@/lib/tr";
import LangToggle from "./LangToggle";
import CartButton from "./CartButton";

export default function Header({ lang, settings }: { lang: Lang; settings: Settings }) {
  const ann = lang === "ar" ? settings.announcement_ar : settings.announcement_fr;
  return (
    <>
      {ann && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">{ann}</div>
      )}
      <header className="sticky top-3 z-40 px-3 sm:px-6">
        <div className="mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border border-white/80 bg-white/55 px-3 ps-4 shadow-[0_10px_40px_-14px_rgba(23,123,144,0.45)] backdrop-blur-2xl sm:h-16 sm:px-5">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Rosa Alba" width={36} height={36} className="h-9 w-9 rounded-full ring-2 ring-white" />
            <span className="font-serif text-lg font-extrabold tracking-[0.18em] sm:text-xl">ROSA ALBA</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <Link href="/#produits" className="hover:text-brand-700">{tr(lang, "Produits", "المنتجات")}</Link>
            {settings.bundle_enabled && (
              <Link href="/routine" className="font-semibold text-brand-700 hover:text-brand-900">{tr(lang, "Pack Routine", "الروتين الكامل")} -{settings.bundle_discount_pct}%</Link>
            )}
            <Link href="/#ingredients" className="hover:text-brand-700">{tr(lang, "Ingrédients", "المكونات")}</Link>
            <Link href="/#commande" className="hover:text-brand-700">{tr(lang, "Comment commander", "كيف أطلب")}</Link>
            <Link href="/#faq" className="hover:text-brand-700">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle />
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}
