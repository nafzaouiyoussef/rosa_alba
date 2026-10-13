import Link from "next/link";
import { computeStats } from "@/lib/admin-data";
import { STATUS_COLOR, STATUS_LABEL, STATUSES } from "@/lib/status";

const mad = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} MAD`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="text-xs font-medium uppercase tracking-wider text-ink/50">{label}</div>
      <div className="mt-2 text-2xl font-bold sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink/50">{hint}</div>}
    </div>
  );
}

function BarList({ rows, fmt }: { rows: { label: string; value: number; sub?: string }[]; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="text-sm text-ink/50">Pas encore de données.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm">
            <span className="truncate font-medium">{r.label}</span>
            <span className="ms-3 shrink-0 text-ink/60">{fmt ? fmt(r.value) : r.value}{r.sub ? ` · ${r.sub}` : ""}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-ink/5">
            <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: { days?: string } }) {
  const days = [7, 14, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 14;
  const s = await computeStats(days);
  const maxOrders = Math.max(1, ...s.perDay.map((d) => d.orders));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
        <div className="flex gap-1 rounded-full bg-white p-1 shadow-soft">
          {[7, 14, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/admin?days=${d}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${d === days ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`}
            >
              {d} j
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Commandes" value={String(s.total)} hint={`sur ${days} jours`} />
        <Card label="Valeur en cours" value={mad(s.pipeline)} hint="hors annulées / retournées" />
        <Card label="Livré (encaissé)" value={mad(s.delivered)} hint="commandes livrées" />
        <Card label="Panier moyen" value={mad(s.aov)} />
        <Card label="Taux de confirmation" value={pct(s.confirmRate)} hint="confirmées + expédiées + livrées" />
        <Card label="Taux de livraison" value={pct(s.deliveryRate)} hint="livrées / expédiées" />
        <Card label="Taux de retour" value={pct(s.returnRate)} hint="retournées / expédiées" />
        <Card label="Nouvelles à traiter" value={String(s.byStatus["new"] || 0)} hint="à appeler" />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-semibold">Commandes par jour</h2>
        <div className="mt-5 flex h-44 items-end gap-1.5" role="img" aria-label="Commandes par jour">
          {s.perDay.map((d) => (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.day} · ${d.orders} commande(s) · ${mad(d.value)}`}>
              <div className="rounded-t bg-brand-600 transition group-hover:bg-ink" style={{ height: `${(d.orders / maxOrders) * 100}%`, minHeight: d.orders ? 4 : 1 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink/45">
          <span>{s.perDay[0]?.day}</span>
          <span>{s.perDay[s.perDay.length - 1]?.day}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="mb-4 font-semibold">Statuts</h2>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((st) => (
              <Link key={st} href={`/admin/orders?status=${st}`} className={`rounded-full px-3 py-1.5 text-sm font-medium ${STATUS_COLOR[st]}`}>
                {STATUS_LABEL[st]} · {s.byStatus[st] || 0}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Produits les plus vendus</h2><Link href="/admin/sales" className="text-sm font-medium text-brand-700 underline">Détail des ventes →</Link></div>
          <BarList rows={s.topProducts.map((p) => ({ label: p.name, value: p.units, sub: mad(p.value) }))} fmt={(n) => `${n} u.`} />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="mb-4 font-semibold">Villes</h2>
          <BarList rows={s.topCities.map((c) => ({ label: c.city, value: c.orders }))} />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="mb-1 font-semibold">Sources de trafic</h2>
          <p className="mb-4 text-xs text-ink/50">Via les paramètres utm_source de vos pubs (ou fbclid / ttclid / gclid).</p>
          <BarList rows={s.sources.map((c) => ({ label: c.source, value: c.orders, sub: mad(c.value) }))} />
        </div>
      </div>
    </div>
  );
}
