import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin-data";
import { STATUS_COLOR } from "@/lib/status";
import { waLink } from "@/lib/wa";
import StatusSelect from "@/components/admin/StatusSelect";
import OrderEditor from "@/components/admin/OrderEditor";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const o = await getOrderById(params.id);
  if (!o) notFound();
  const wa = waLink(
    o.phone.replace(/^0/, "+212"),
    `Bonjour ${o.customer_name}, ici Rosa Alba. Nous confirmons votre commande ${o.order_number} : ${o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}. Total à payer à la livraison : ${o.total} MAD. Livraison gratuite à ${o.city}. Est-ce correct ?`
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-ink/60 hover:text-ink">← Commandes</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">{o.order_number}</h1>
        <StatusSelect id={o.id} status={o.status} className={STATUS_COLOR[o.status]} />
      </div>
      <p className="mt-1 text-sm text-ink/55">
        Passée le {new Date(o.created_at).toLocaleString("fr-FR")} · langue : {o.lang} · page : {o.source || "—"}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="mb-3 font-semibold">Client</h2>
          <OrderEditor id={o.id} name={o.customer_name} phone={o.phone} city={o.city} address={o.address} adminNotes={o.admin_notes} />
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`tel:${o.phone}`} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">📞 Appeler</a>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white">WhatsApp</a>}
          </div>
          {o.notes && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm"><b>Note du client :</b> {o.notes}</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-soft">
          <h2 className="mb-3 font-semibold">Produits</h2>
          <ul className="divide-y divide-ink/10 text-sm">
            {o.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-3 py-2.5">
                <span>{i.qty} × {i.name}{i.upsell && <span className="ms-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">upsell</span>}</span>
                <span className="font-medium">{Math.round(i.line_total)} MAD</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
            <div className="flex justify-between"><span>Sous-total</span><span>{Math.round(Number(o.subtotal))} MAD</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{Number(o.shipping) ? `${Math.round(Number(o.shipping))} MAD` : "Gratuite"}</span></div>
            <div className="flex justify-between text-base font-bold"><span>À encaisser (COD)</span><span>{Math.round(Number(o.total))} MAD</span></div>
          </div>
          {Object.keys(o.utm || {}).length > 0 && (
            <div className="mt-5 rounded-xl bg-brand-50 p-3 text-xs">
              <div className="mb-1 font-semibold">Attribution pub</div>
              {Object.entries(o.utm).map(([k, v]) => (
                <div key={k} className="truncate"><span className="text-ink/50">{k}:</span> {String(v)}</div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
