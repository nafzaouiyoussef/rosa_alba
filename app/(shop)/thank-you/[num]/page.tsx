import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber, getProducts, getSettings } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { fmt, lineTotal } from "@/lib/pricing";
import { pick, tr } from "@/lib/tr";
import { waLink } from "@/lib/wa";
import PurchaseTracker from "@/components/PurchaseTracker";
import UpsellCard from "@/components/UpsellCard";

export const metadata: Metadata = { title: "Merci pour votre commande", robots: { index: false } };

export default async function ThankYou({ params, searchParams }: { params: { num: string }; searchParams: { t?: string } }) {
  const lang = getLang();
  const order = await getOrderByNumber(params.num);
  // the token in the URL proves the visitor created this order (orders contain personal data)
  if (!order || !searchParams.t || order.upsell_token !== searchParams.t) notFound();

  const settings = await getSettings();
  const products = await getProducts();
  const inOrder = new Set(order.items.map((i) => i.product_id));
  const hasUpsell = order.items.some((i) => i.upsell);
  const upsellable =
    settings.upsell_enabled && order.status === "new" && !hasUpsell
      ? products.filter((p) => !inOrder.has(p.id) && p.stock > 0).slice(0, 2)
      : [];

  const wa = waLink(
    settings.whatsapp,
    `Bonjour, je viens de passer la commande ${order.order_number}.`
  );

  return (
    <div className="container-x max-w-2xl py-10 sm:py-14">
      <PurchaseTracker
        orderNumber={order.order_number}
        total={Number(order.total)}
        items={order.items.map((i) => ({ id: i.product_id, name: i.name, price: i.unit_price, qty: i.qty }))}
      />

      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-3xl text-white pop">✓</div>
        <h1 className="mt-5 font-serif text-4xl font-bold">
          {tr(lang, `Merci ${order.customer_name.split(" ")[0]} !`, `شكراً ${order.customer_name.split(" ")[0]}!`)}
        </h1>
        <p className="mt-2 text-ink/70">{tr(lang, "Votre commande est bien enregistrée.", "تم تسجيل طلبك بنجاح.")}</p>
        <div className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold shadow-soft">
          {tr(lang, "N° de commande", "رقم الطلب")} : {order.order_number}
        </div>
      </div>

      <div className="card mt-8 p-5 sm:p-6">
        <h2 className="font-semibold">{tr(lang, "Et maintenant ?", "ماذا بعد؟")}</h2>
        <ol className="mt-3 space-y-3 text-sm text-ink/75">
          <li className="flex gap-3"><span className="font-bold text-brand-600">1.</span>{tr(lang, `Notre équipe vous appelle au ${order.phone} pour confirmer.`, `سيتصل بك فريقنا على الرقم ${order.phone} لتأكيد الطلب.`)}</li>
          <li className="flex gap-3"><span className="font-bold text-brand-600">2.</span>{tr(lang, `Livraison gratuite à ${order.city} en ${settings.delivery_days}.`, `توصيل مجاني إلى ${order.city} خلال ${settings.delivery_days}.`)}</li>
          <li className="flex gap-3"><span className="font-bold text-brand-600">3.</span>{tr(lang, "Vous payez en espèces à la réception.", "تدفعين نقداً عند الاستلام.")}</li>
        </ol>
        <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm">
          {tr(lang, "📞 Merci de répondre à notre appel : sans confirmation, la commande ne peut pas partir.", "📞 المرجو الرد على مكالمتنا: بدون تأكيد لا يمكن إرسال الطلب.")}
        </p>
      </div>

      <div className="card mt-5 p-5 sm:p-6">
        <h2 className="font-semibold">{tr(lang, "Récapitulatif", "ملخص الطلب")}</h2>
        <ul className="mt-3 divide-y divide-ink/10 text-sm">
          {order.items.map((i, idx) => {
            const p = products.find((x) => x.id === i.product_id);
            return (
              <li key={idx} className="flex justify-between py-2.5">
                <span>
                  {i.qty} × {p ? (pick(p, "name", lang) as string) : i.name}
                  {i.upsell && <span className="ms-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-[#7a5d1c]">{tr(lang, "offre exclusive", "عرض خاص")}</span>}
                </span>
                <span className="font-medium">{fmt(i.line_total, lang)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-sm">
          <span>{tr(lang, "Livraison", "التوصيل")}</span>
          <span className="font-semibold text-brand-700">{Number(order.shipping) > 0 ? fmt(Number(order.shipping), lang) : tr(lang, "GRATUITE", "مجاني")}</span>
        </div>
        <div className="mt-2 flex justify-between text-lg font-bold">
          <span>{tr(lang, "À payer à la livraison", "المبلغ عند الاستلام")}</span>
          <span>{fmt(Number(order.total), lang)}</span>
        </div>
        <div className="mt-3 text-xs text-ink/55">
          {order.customer_name} · {order.address}, {order.city}
        </div>
      </div>

      {upsellable.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-2xl font-bold">
            {tr(lang, `🎁 Offre exclusive : -${settings.upsell_discount_pct}% sur votre commande`, `🎁 عرض خاص: خصم ${settings.upsell_discount_pct}% على طلبك`)}
          </h2>
          <p className="mt-1 text-sm text-ink/65">
            {tr(lang, "Ajoutez un soin à votre colis, même livraison, même paiement à la réception. Offre valable maintenant seulement.", "أضيفي منتجاً إلى طردك، نفس التوصيل ونفس الدفع عند الاستلام. العرض صالح الآن فقط.")}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {upsellable.map((p) => (
              <UpsellCard
                key={p.id}
                product={p}
                orderNumber={order.order_number}
                token={order.upsell_token}
                price={lineTotal(p, 1, Number(settings.upsell_discount_pct))}
                fullPrice={Number(p.price)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white">
            {tr(lang, "Nous écrire sur WhatsApp", "راسلينا عبر واتساب")}
          </a>
        )}
        <Link href="/" className="btn-ghost">{tr(lang, "Retour à la boutique", "العودة إلى المتجر")}</Link>
      </div>
    </div>
  );
}
