import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getProductById, getSettings } from "@/lib/data";
import { lineTotal } from "@/lib/pricing";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

/** Adds ONE discounted product to an order that is still "new" (thank-you page upsell). */
export async function POST(req: Request) {
  const c = db();
  if (!c) return bad("Store database not configured", 503);

  const { order_number, token, product_id } = await req.json().catch(() => ({}));
  if (!order_number || !token || !product_id) return bad("Invalid request");

  const { data } = await c.from("orders").select("*").eq("order_number", order_number).maybeSingle();
  const order = data as Order | null;
  if (!order || order.upsell_token !== token) return bad("Order not found", 404);
  if (order.status !== "new") return bad("Order already processed");
  if (Date.now() - new Date(order.created_at).getTime() > 6 * 3600 * 1000) return bad("Offer expired");
  if (order.items.some((i) => i.upsell)) return bad("Offer already used");
  if (order.items.some((i) => i.product_id === product_id)) return bad("Already in your order");

  const settings = await getSettings();
  if (!settings.upsell_enabled) return bad("Offer unavailable");

  const p = await getProductById(product_id);
  if (!p || !p.is_active || p.stock < 1) return bad("Product unavailable");

  const pct = Math.max(0, Math.min(50, Number(settings.upsell_discount_pct) || 0));
  const line: OrderItem = {
    product_id: p.id,
    slug: p.slug,
    name: p.name_fr,
    qty: 1,
    unit_price: Number(p.price),
    line_total: lineTotal(p, 1, pct),
    image: p.images?.[0] || "",
    upsell: true
  };

  const items = [...order.items, line];
  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  const total = subtotal + Number(order.shipping);

  const { error } = await c.from("orders").update({ items, subtotal, total, updated_at: new Date().toISOString() }).eq("id", order.id);
  if (error) return bad("Could not update order", 500);
  await c.from("products").update({ stock: Math.max(0, p.stock - 1) }).eq("id", p.id);

  return NextResponse.json({ ok: true, added: line, total });
}
