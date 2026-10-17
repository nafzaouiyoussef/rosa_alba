import type { OrderItem } from "./types";
import { SITE } from "./seo";

type NewOrder = {
  id?: string;
  order_number: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  source: string;
  utm: Record<string, string>;
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const mad = (n: number) => `${Math.round(Number(n)).toLocaleString("fr-FR")} MAD`;

/**
 * Emails the shop owner when a new order comes in (Resend). Never throws: a mail problem must not block an order.
 * Needs RESEND_API_KEY. Optional: ORDER_NOTIFY_EMAIL (default below), RESEND_FROM.
 */
export async function notifyNewOrder(o: NewOrder): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const to = (process.env.ORDER_NOTIFY_EMAIL || "youssefnafzaoui1@gmail.com").split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.RESEND_FROM || "Rosa Alba <onboarding@resend.dev>";

  const digits = o.phone.replace(/\D/g, "");
  const wa = `https://wa.me/${digits.startsWith("0") ? "212" + digits.slice(1) : digits}`;
  const src = o.utm?.utm_source || o.source || "direct";
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(i.name)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">× ${i.qty}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${mad(i.line_total)}</td></tr>`
    )
    .join("");
  const adminUrl = o.id ? `${SITE}/admin/orders/${o.id}` : `${SITE}/admin/orders`;

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f2a33">
  <h2 style="margin:0 0 4px">🛍️ Nouvelle commande ${esc(o.order_number)}</h2>
  <p style="margin:0 0 16px;color:#555">Paiement à la livraison · à appeler pour confirmer</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
    <tr><td colspan="2" style="padding:6px 8px;text-align:right">Livraison</td><td style="padding:6px 8px;text-align:right">${o.shipping > 0 ? mad(o.shipping) : "Gratuite"}</td></tr>
    <tr><td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Total à encaisser</td><td style="padding:8px;text-align:right;font-weight:bold;font-size:16px">${mad(o.total)}</td></tr>
  </table>
  <h3 style="margin:20px 0 6px">Client</h3>
  <p style="margin:0;line-height:1.6;font-size:14px">
    <b>${esc(o.customer_name)}</b><br>
    📞 <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a> · <a href="${wa}">WhatsApp</a><br>
    📍 ${esc(o.city)} — ${esc(o.address)}
    ${o.notes ? `<br>📝 ${esc(o.notes)}` : ""}
  </p>
  <p style="margin:16px 0 0;font-size:12px;color:#777">Source : ${esc(src)}</p>
  <p style="margin:20px 0 0"><a href="${adminUrl}" style="background:#0f2a33;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-size:14px">Ouvrir dans l'admin</a></p>
</div>`;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `Nouvelle commande ${o.order_number} — ${mad(o.total)} — ${o.city}`,
        html,
        text: [
          `Nouvelle commande ${o.order_number}`,
          ...o.items.map((i) => `- ${i.name} x${i.qty} : ${mad(i.line_total)}`),
          `Total à encaisser : ${mad(o.total)}`,
          `Client : ${o.customer_name} · ${o.phone}`,
          `Adresse : ${o.city} — ${o.address}`,
          o.notes ? `Note : ${o.notes}` : "",
          `Admin : ${adminUrl}`
        ].filter(Boolean).join("\n")
      }),
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (!res.ok) console.error("order email failed", res.status, (await res.text()).slice(0, 300));
  } catch (e) {
    console.error("order email error", e);
  }
}
