import Link from "next/link";
import type { Lang, Settings } from "@/lib/types";
import { tr } from "@/lib/tr";
import { waLink } from "@/lib/wa";

export default function Footer({ lang, settings }: { lang: Lang; settings: Settings }) {
  const wa = waLink(settings.whatsapp);
  return (
    <footer className="relative mt-10 overflow-hidden rounded-t-[2.5rem] bg-[#06181e] pb-28 pt-14 text-white/80 sm:pb-12">
      <div className="orb -top-24 start-1/4 h-64 w-64 bg-brand-500/30" />
      <div className="container-x relative grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-serif text-3xl font-bold text-white">ROSA ALBA</div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            {tr(
              lang,
              "Soins naturels aux huiles précieuses du Maroc. Livrés chez vous, payables à la réception.",
              "عناية طبيعية بزيوت مغربية فاخرة. نوصلها لك والدفع عند الاستلام."
            )}
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-semibold text-white">{tr(lang, "Boutique", "المتجر")}</div>
          <ul className="space-y-2">
            <li><Link href="/#produits" className="hover:text-white">{tr(lang, "Tous les produits", "كل المنتجات")}</Link></li>
            <li><Link href="/#faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/checkout" className="hover:text-white">{tr(lang, "Mon panier", "سلتي")}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-semibold text-white">{tr(lang, "Nous suivre", "تابعينا")}</div>
          <ul className="space-y-2">
            {settings.instagram && (
              <li>
                <a href={`https://www.instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Instagram @{settings.instagram}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="container-x mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
        © {new Date().getFullYear()} Rosa Alba. {tr(lang, "Tous droits réservés.", "جميع الحقوق محفوظة.")}
      </div>
    </footer>
  );
}
