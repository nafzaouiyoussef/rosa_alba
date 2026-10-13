import { listCustomers } from "@/lib/admin-data";
import { waLink } from "@/lib/wa";

export default async function AdminCustomers({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  const customers = await listCustomers(q);
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-serif text-3xl font-bold">Clients <span className="text-lg text-ink/45">({customers.length})</span></h1>
      <p className="mt-2 text-sm text-ink/60">Regroupés par numéro de téléphone. Le montant dépensé ne compte que les commandes livrées.</p>
      <form className="mt-4 flex gap-2" action="/admin/customers">
        <input name="q" defaultValue={q} placeholder="Nom, téléphone, ville…" className="input !py-2.5" />
        <button className="btn-primary !px-6 !py-2.5 text-sm">Chercher</button>
      </form>
      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="p-4 text-start">Client</th>
              <th className="p-4 text-start">Ville</th>
              <th className="p-4 text-start">Commandes</th>
              <th className="p-4 text-start">Livrées</th>
              <th className="p-4 text-start">Dépensé</th>
              <th className="p-4 text-start">Dernière</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {customers.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-ink/50">Aucun client pour l&apos;instant.</td></tr>}
            {customers.map((c) => (
              <tr key={c.phone}>
                <td className="p-4"><div className="font-medium">{c.name}</div><div className="text-xs text-ink/55">{c.phone}</div></td>
                <td className="p-4">{c.city}</td>
                <td className="p-4">{c.orders}{c.orders > 1 && <span className="ms-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">fidèle</span>}</td>
                <td className="p-4">{c.delivered}</td>
                <td className="p-4 font-semibold">{Math.round(c.spent)} MAD</td>
                <td className="p-4 text-xs text-ink/60">{new Date(c.last).toLocaleDateString("fr-FR")}</td>
                <td className="p-4 text-end">
                  <a href={waLink(c.phone.replace(/^0/, "+212"))} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-emerald-700 hover:underline">WhatsApp ↗</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
