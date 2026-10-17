import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getProducts, getProductsByIds, getSettings } from "@/lib/data";
import { lineTotal } from "@/lib/pricing";
import { normalizePhone } from "@/lib/cities";
import type { OrderItem } from "@/lib/types";
import { notifyNewOrder } from "@/lib/notify";

export const dynamic = "force-dynamic";

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const c = db();
  if (!c) return bad("Store database not configured yet (missing Supabase env vars).", 503);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request");
  }

  if (body?.hp) return bad("Invalid request"); // honeypot

  const lang = body.lang === "ar" ? "ar" : "fr";
  const name = String(body.name || "").trim().slice(0, 120);
  const phone = normalizePhone(String(body.phone || ""));
  const city = String(body.city || "").trim().slice(0, 80);
  const address = String(body.address || "").trim().slice(0, 300);
  const notes = String(body.notes || "").trim().slice(0, 500);
  const source = String(body.source || "").slice(0, 200);

  if (name.length < 3 || !phone || !city || address.length < 6) {
    return bad(lang === "ar" ? "المرجو التحقق من المعلومات المدخلة." : "Veuillez vérifier vos informations.");
  }

  const settings = await getSettings();

  // merge duplicate product ids, clamp quantities
  const wanted = new Map<string, number>();
  const bundle = body.bundle === true && settings.bundle_enabled;
  const bundlePct = bundle ? Math.max(0, Math.min(50, Number(settings.bundle_discount_pct) || 0)) : 0;
  if (bundle) {
    // "Routine complète": one of every active, in-stock product, at the bundle discount (computed here, never trusted from the browser)
    for (const p of await getProducts()) if (p.stock > 0) wanted.set(p.id, 1);
    if (wanted.size < 2) return bad(lang === "ar" ? "العرض غير متوفر حالياً." : "Offre indisponible pour le moment.");
  } else {
    for (const it of Array.isArray(body.items) ? body.items.slice(0, 12) : []) {
      const id = String(it?.product_id || "");
      const q = Math.max(1, Math.min(10, parseInt(it?.qty, 10) || 1));
      if (id) wanted.set(id, Math.min(10, (wanted.get(id) || 0) + q));
    }
  }
  if (!wanted.size) return bad(lang === "ar" ? "السلة فارغة." : "Panier vide.");

  const products = await getProductsByIds([...wanted.keys()]);
  const items: OrderItem[] = [];
  for (const [id, qty] of wanted) {
    const p = products.find((x) => x.id === id);
    if (!p || !p.is_active) return bad(lang === "ar" ? "منتج غير متوفر." : "Produit indisponible.");
    if (p.stock < qty) {
      return bad(
        lang === "ar" ? `الكمية المتوفرة من ${p.name_ar || p.name_fr} غير كافية.` : `Stock insuffisant pour ${p.name_fr}.`
      );
    }
    const total = lineTotal(p, qty, bundlePct);
    items.push({
      product_id: p.id,
      slug: p.slug,
      name: p.name_fr,
      qty,
      unit_price: Number(p.price),
      line_total: total,
      image: p.images?.[0] || ""
    });
  }

  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  const shipping = Number(settings.shipping_fee) || 0;
  const total = subtotal + shipping;

  // duplicate guard: same phone + same total in the last 3 minutes → reuse the order
  const since = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  const { data: dup } = await c
    .from("orders")
    .select("order_number, upsell_token")
    .eq("phone", phone)
    .eq("total", total)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();
  if (dup) return NextResponse.json({ ok: true, order_number: dup.order_number, token: dup.upsell_token });

  const utm = body.utm && typeof body.utm === "object" ? body.utm : {};
  const safeUtm: Record<string, string> = {};
  for (const [k, v] of Object.entries(utm).slice(0, 15)) safeUtm[k.slice(0, 40)] = String(v).slice(0, 200);

  const { data: order, error } = await c
    .from("orders")
    .insert({
      customer_name: name,
      phone,
      city,
      address,
      notes,
      items,
      subtotal,
      shipping,
      total,
      source,
      utm: safeUtm,
      lang
    })
    .select("id, order_number, upsell_token")
    .single();

  if (error || !order) {
    console.error("order insert failed", error);
    return bad(lang === "ar" ? "تعذر تسجيل الطلب." : "Impossible d'enregistrer la commande.", 500);
  }

  // decrement stock (best effort)
  for (const it of items) {
    const p = products.find((x) => x.id === it.product_id)!;
    await c.from("products").update({ stock: Math.max(0, p.stock - it.qty) }).eq("id", p.id);
  }

  // e-mail the shop owner (never blocks or fails the order)
  await notifyNewOrder({ id: order.id, order_number: order.order_number, customer_name: name, phone, city, address, notes, items, subtotal, shipping, total, source, utm: safeUtm });

  return NextResponse.json({ ok: true, order_number: order.order_number, token: order.upsell_token });
}
