import Link from "next/link";
import { listOrders } from "@/lib/admin-data";
import { STATUSES, STATUS_COLOR, STATUS_LABEL } from "@/lib/status";
import { waLink } from "@/lib/wa";
import StatusSelect from "@/components/admin/StatusSelect";

const PAGE = 50;

export default async function AdminOrders({ searchParams }: { searchParams: { status?: string; q?: string; page?: string } }) {
  const status = STATUSES.includes(searchParams.status as any) ? searchParams.status : undefined;
  const q = (searchParams.q || "").trim();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const { orders, count } = await listOrders({ status, q, limit: PAGE, offset: (page - 1) * PAGE });
  const pages = Math.max(1, Math.ceil(count / PAGE));
  const qs = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    Object.entries({ status, q, ...o }).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">Commandes <span className="text-lg text-ink/45">({count})</span></h1>
        <a href={`/api/admin/orders/export${status ? `?status=${status}` : ""}`} className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-medium hover:border-ink/50">
          ⬇ Export CSV
        </a>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/admin/orders${qs({ status: undefined, page: undefined })}`} className={`rounded-full px-4 py-1.5 text-sm font-medium ${!status ? "bg-ink text-white" : "bg-white"}`}>Toutes</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders${qs({ status: s, page: undefined })}`} className={`rounded-full px-4 py-1.5 text-sm font-medium ${status === s ? "bg-ink text-white" : "bg-white"}`}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <form className="mt-4 flex gap-2" action="/admin/orders">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Rechercher : nom, téléphone, ville, n° RA-…" className="input !py-2.5" />
        <button className="btn-primary !px-6 !py-2.5 text-sm">Chercher</button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="p-4 text-start">Commande</th>
              <th className="p-4 text-start">Client</th>
              <th className="p-4 text-start">Produits</th>
              <th className="p-4 text-start">Total</th>
              <th className="p-4 text-start">Statut</th>
              <th className="p-4 text-start">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-10 text-center text-ink/50">Aucune commande.</td></tr>
            )}
            {orders.map((o) => {
              const wa = waLink(o.phone.replace(/^0/, "+212"), `Bonjour ${o.customer_name}, ici Rosa Alba. Nous confirmons votre commande ${o.order_number} (${o.total} MAD, paiement à la livraison). Est-ce bien correct ?`);
              return (
                <tr key={o.id} className="align-top hover:bg-brand-50/40">
                  <td className="p-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.order_number}</Link>
                    <div className="text-xs text-ink/50">{new Date(o.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-ink/60">{o.city}</div>
                  </td>
                  <td className="p-4 text-xs text-ink/75">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                  <td className="p-4 font-semibold">{Math.round(Number(o.total))} MAD</td>
                  <td className="p-4">
                    <StatusSelect id={o.id} status={o.status} className={STATUS_COLOR[o.status]} />
                  </td>
                  <td className="p-4 text-xs">
                    <a href={`tel:${o.phone}`} className="block font-medium hover:underline">{o.phone}</a>
                    {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">WhatsApp ↗</a>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link className="rounded-full bg-white px-4 py-2" href={`/admin/orders${qs({ page: String(page - 1) })}`}>← Précédent</Link>}
          <span className="text-ink/60">Page {page} / {pages}</span>
          {page < pages && <Link className="rounded-full bg-white px-4 py-2" href={`/admin/orders${qs({ page: String(page + 1) })}`}>Suivant →</Link>}
        </div>
      )}
    </div>
  );
}
