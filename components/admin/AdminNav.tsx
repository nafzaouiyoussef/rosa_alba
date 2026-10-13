"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/orders", label: "Commandes", icon: "📦" },
  { href: "/admin/sales", label: "Ventes par produit", icon: "💰" },
  { href: "/admin/products", label: "Produits", icon: "🧴" },
  { href: "/admin/customers", label: "Clients", icon: "👥" },
  { href: "/admin/reviews", label: "Avis", icon: "⭐" },
  { href: "/admin/settings", label: "Réglages & tracking", icon: "⚙️" }
];

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-ink/10 bg-ink text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0">
      <div className="flex items-center justify-between px-4 py-3 md:block md:px-5 md:py-6">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-8 w-8" />
          <span className="font-serif text-lg font-bold tracking-wide">ROSA ALBA</span>
        </div>
        <button onClick={logout} className="text-xs text-white/60 hover:text-white md:mt-1 md:block">
          Déconnexion
        </button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
        {LINKS.map((l) => {
          const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                active ? "bg-white text-ink" : "text-white/75 hover:bg-white/10"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
        <Link href="/" target="_blank" className="mt-2 hidden items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-white/60 hover:text-white md:flex">
          ↗ Voir la boutique
        </Link>
      </nav>
    </aside>
  );
}
