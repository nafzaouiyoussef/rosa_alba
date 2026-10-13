import Link from "next/link";
import { computeProductSales } from "@/lib/admin-data";

const mad = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} MAD`;

function Spark({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-8 items-end gap-px" aria-hidden="true">
      {data.map((v, i) => (
        <div key={i} className="w-1 rounded-t bg-brand-500/70" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 3 : 1 }} />
      ))}
    </div>
  );
}

export default async function SalesPage({ searchParams }: { searchParams: { days?: string } }) {
  const days = [7, 14, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const { rows, totals } = await computeProductSales(days);
  const best = rows.find((r) => r.units > 0);
  const maxRev = Math.max(1, ...rows.map((r) => r.revenue));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Ventes par produit</h1>
          <p className="mt-1 text-sm text-ink/55">Calculé à partir de vos commandes. Les annulées et retournées sont exclues du chiffre d&apos;affaires.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-soft">
          {[7, 14, 30, 90].map((d) => (
            <Link key={d} href={`/admin/sales?days=${d}`} className={`rounded-full px-4 py-1.5 text-sm font-medium ${d === days ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`}>
              {d} j
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Unités vendues", String(totals.units), `${totals.orders} commandes`],
          ["Chiffre d'affaires", mad(totals.revenue), "hors annulées / retours"],
          ["Encaissé (livré)", mad(totals.delivered), "paiement reçu à la livraison"],
          ["Meilleure vente", best ? best.name : "—", best ? `${best.units} unités · ${mad(best.revenue)}` : "pas encore de ventes"]
        ].map(([l, v, h]) => (
          <div key={l} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="text-xs font-medium uppercase tracking-wider text-ink/50">{l}</div>
            <div className="mt-2 truncate text-xl font-bold sm:text-2xl">{v}</div>
            <div className="mt-1 text-xs text-ink/50">{h}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-ink/[0.03] text-start text-xs uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-4 py-3 text-start">Produit</th>
                <th className="px-4 py-3 text-end">Unités</th>
                <th className="px-4 py-3 text-end">Commandes</th>
                <th className="px-4 py-3 text-start">Chiffre d&apos;affaires</th>
                <th className="px-4 py-3 text-end">Encaissé</th>
                <th className="px-4 py-3 text-end">En cours</th>
                <th className="px-4 py-3 text-end">Annulé / retour</th>
                <th className="px-4 py-3 text-end">Stock</th>
                <th className="px-4 py-3 text-start">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((r) => (
                <tr key={r.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {r.image ? <img src={r.image} alt="" className="h-12 w-10 rounded-lg object-cover" /> : <div className="h-12 w-10 rounded-lg bg-brand-100" />}
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-ink/50">{r.price ? mad(r.price) : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-end font-semibold">{r.units}</td>
                  <td className="px-4 py-3 text-end">{r.orders}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2 text-xs"><b className="text-sm">{mad(r.revenue)}</b><span className="text-ink/50">{Math.round(r.share * 100)}%</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-ink/5"><div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${(r.revenue / maxRev) * 100}%` }} /></div>
                  </td>
                  <td className="px-4 py-3 text-end text-emerald-700">{mad(r.delivered)}</td>
                  <td className="px-4 py-3 text-end text-amber-700">{mad(r.pending)}</td>
                  <td className="px-4 py-3 text-end text-rose-700">{r.lostUnits ? `${r.lostUnits} u.` : "—"}</td>
                  <td className={`px-4 py-3 text-end ${r.stock !== null && r.stock <= 10 ? "font-semibold text-red-600" : ""}`}>{r.stock ?? "—"}</td>
                  <td className="px-4 py-3"><Spark data={r.perDay} /></td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-ink/50">Pas encore de données.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink/45">La tendance montre les unités vendues par jour sur la période. Les packs « Routine complète » comptent une unité pour chaque produit inclus.</p>
    </div>
  );
}
