import { db } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

/** CSV export (for your delivery company / Excel). ?status=new|confirmed|… */
export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  const c = db();
  if (!c) return new Response("Supabase not configured", { status: 503 });

  const status = new URL(req.url).searchParams.get("status");
  let q = c.from("orders").select("*").order("created_at", { ascending: false }).limit(5000);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const orders = (data as Order[]) || [];

  const head = ["N° commande", "Date", "Statut", "Nom", "Téléphone", "Ville", "Adresse", "Produits", "Total (MAD)", "Source", "Notes client", "Notes admin"];
  const rows = orders.map((o) => [
    o.order_number,
    new Date(o.created_at).toISOString().replace("T", " ").slice(0, 16),
    o.status,
    o.customer_name,
    o.phone,
    o.city,
    o.address,
    o.items.map((i) => `${i.qty}x ${i.name}`).join(" + "),
    o.total,
    o.utm?.utm_source || o.source,
    o.notes,
    o.admin_notes
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-rosa-alba-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
