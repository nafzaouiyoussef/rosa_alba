import Link from "next/link";
import { getProducts } from "@/lib/data";
import QuickProductRow from "@/components/admin/QuickProductRow";

export default async function AdminProducts() {
  const products = await getProducts({ all: true });
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">Produits</h1>
        <Link href="/admin/products/new" className="btn-primary !py-2.5 text-sm">+ Nouveau produit</Link>
      </div>
      <p className="mt-2 text-sm text-ink/60">
        Les prix affichés sont des <b>exemples</b> : modifiez-les ici (prix, stock, visibilité) ou ouvrez un produit pour tout éditer (textes FR/AR, photos, remises).
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-ink/10 text-start text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="p-4 text-start">Produit</th>
              <th className="p-4 text-start">Prix (MAD)</th>
              <th className="p-4 text-start">Stock</th>
              <th className="p-4 text-start">Visible</th>
              <th className="p-4 text-start">Liens</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {products.map((p) => (
              <QuickProductRow key={p.id} p={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
