import { db } from "./supabase";
import type { Order, OrderStatus, Review } from "./types";
import seed from "../supabase/seed-products.json";

/**
 * Sample orders so the admin can be previewed without Supabase. Only active when ADMIN_DEMO=1
 * and no database is configured; never touches real data.
 */
function demoOrders(): Order[] {
  let x = 7;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const products = seed as any[];
  const cities = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan"];
  const names = ["Salma B.", "Imane K.", "Khadija R.", "Sara M.", "Nada A.", "Houda T.", "Meryem L.", "Zineb E.", "Loubna H.", "Aya F."];
  const sources = ["meta", "meta", "meta", "tiktok", "tiktok", "google", "direct"];
  const out: Order[] = [];
  for (let i = 0; i < 70; i++) {
    const daysAgo = Math.floor(Math.pow(rnd(), 1.4) * 30);
    const created = new Date(Date.now() - daysAgo * 86400000 - Math.floor(rnd() * 80000000)).toISOString();
    const n = rnd() < 0.15 ? products.length : 1 + (rnd() < 0.3 ? 1 : 0);
    const bundle = n === products.length;
    const picked = bundle ? products : [products[Math.floor(Math.pow(rnd(), 1.3) * products.length)]];
    const items = picked.map((p: any) => {
      const qty = bundle ? 1 : 1 + (rnd() < 0.3 ? 1 : 0);
      const pct = bundle ? 20 : qty === 2 ? Number(p.disc_2) : 0;
      return {
        product_id: p.slug,
        slug: p.slug,
        name: p.name_fr,
        qty,
        unit_price: Number(p.price),
        line_total: Math.round(Number(p.price) * qty * (1 - pct / 100)),
        image: p.images?.[0] || ""
      };
    });
    const age = daysAgo;
    const r = rnd();
    const status: OrderStatus =
      age < 1 ? "new" : age < 2 ? (r < 0.5 ? "new" : "confirmed") : r < 0.12 ? "cancelled" : r < 0.2 ? "returned" : age < 4 ? (r < 0.5 ? "shipped" : "confirmed") : "delivered";
    const subtotal = items.reduce((s, it) => s + it.line_total, 0);
    const src = sources[Math.floor(rnd() * sources.length)];
    out.push({
      id: `demo-${i}`,
      order_number: `RA-D${String(1000 + i)}`,
      status,
      customer_name: names[i % names.length],
      phone: `06${String(10000000 + Math.floor(rnd() * 89999999))}`,
      city: cities[Math.floor(rnd() * cities.length)],
      address: "Adresse exemple",
      notes: "",
      items,
      subtotal,
      shipping: 0,
      total: subtotal,
      payment_method: "cod",
      source: "/demo",
      utm: { utm_source: src },
      lang: "fr",
      upsell_token: "",
      admin_notes: "",
      created_at: created,
      updated_at: created
    } as Order);
  }
  return out.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
const demoOn = () => process.env.ADMIN_DEMO === "1";

export async function listOrders(opts: { status?: string; q?: string; days?: number; limit?: number; offset?: number } = {}) {
  const c = db();
  if (!c) {
    if (!demoOn()) return { orders: [] as Order[], count: 0 };
    let list = demoOrders();
    if (opts.status) list = list.filter((o) => o.status === opts.status);
    if (opts.days) list = list.filter((o) => Date.parse(o.created_at) >= Date.now() - opts.days! * 86400000);
    if (opts.q) {
      const s = opts.q.toLowerCase();
      list = list.filter((o) => [o.customer_name, o.phone, o.order_number, o.city].some((v) => v.toLowerCase().includes(s)));
    }
    const off = opts.offset ?? 0;
    return { orders: list.slice(off, off + (opts.limit ?? 50)), count: list.length };
  }
  let q = c.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.days) q = q.gte("created_at", new Date(Date.now() - opts.days * 86400000).toISOString());
  if (opts.q) {
    const s = opts.q.replace(/[%,()]/g, " ").trim();
    if (s) q = q.or(`customer_name.ilike.%${s}%,phone.ilike.%${s}%,order_number.ilike.%${s}%,city.ilike.%${s}%`);
  }
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const { data, count } = await q.range(offset, offset + limit - 1);
  return { orders: (data as Order[]) || [], count: count || 0 };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const c = db();
  if (!c) return demoOn() ? demoOrders().find((o) => o.id === id) || null : null;
  const { data } = await c.from("orders").select("*").eq("id", id).maybeSingle();
  return (data as Order) || null;
}

export async function listAllReviews(): Promise<(Review & { product_name?: string })[]> {
  const c = db();
  if (!c) return [];
  const { data } = await c.from("reviews").select("*, products(name_fr)").order("created_at", { ascending: false }).limit(200);
  return ((data as any[]) || []).map((r) => ({ ...r, product_name: r.products?.name_fr }));
}

export type Stats = {
  total: number;
  pipeline: number; // value of non-cancelled/returned orders
  delivered: number; // value of delivered orders
  aov: number;
  confirmRate: number;
  deliveryRate: number;
  returnRate: number;
  byStatus: Record<string, number>;
  perDay: { day: string; orders: number; value: number }[];
  topProducts: { name: string; units: number; value: number }[];
  topCities: { city: string; orders: number }[];
  sources: { source: string; orders: number; value: number }[];
};

export async function computeStats(days: number): Promise<Stats> {
  const { orders } = await listOrders({ days, limit: 5000 });
  const dead = new Set(["cancelled", "returned"]);
  const live = orders.filter((o) => !dead.has(o.status));
  const byStatus: Record<string, number> = {};
  orders.forEach((o) => (byStatus[o.status] = (byStatus[o.status] || 0) + 1));

  const confirmedLike = orders.filter((o) => ["confirmed", "shipped", "delivered"].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === "delivered");
  const shippedOrDone = orders.filter((o) => ["shipped", "delivered", "returned"].includes(o.status)).length;

  const perDayMap = new Map<string, { orders: number; value: number }>();
  for (let i = days - 1; i >= 0 && i < 90; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    perDayMap.set(d, { orders: 0, value: 0 });
  }
  orders.forEach((o) => {
    const d = o.created_at.slice(0, 10);
    const e = perDayMap.get(d);
    if (e) {
      e.orders += 1;
      if (!dead.has(o.status)) e.value += Number(o.total);
    }
  });

  const prod = new Map<string, { units: number; value: number }>();
  live.forEach((o) =>
    o.items.forEach((i) => {
      const e = prod.get(i.name) || { units: 0, value: 0 };
      e.units += i.qty;
      e.value += i.line_total;
      prod.set(i.name, e);
    })
  );

  const cities = new Map<string, number>();
  orders.forEach((o) => cities.set(o.city, (cities.get(o.city) || 0) + 1));

  const src = new Map<string, { orders: number; value: number }>();
  orders.forEach((o) => {
    const s = o.utm?.utm_source || (o.utm?.fbclid ? "facebook" : o.utm?.ttclid ? "tiktok" : o.utm?.gclid ? "google" : "direct");
    const e = src.get(s) || { orders: 0, value: 0 };
    e.orders += 1;
    if (!dead.has(o.status)) e.value += Number(o.total);
    src.set(s, e);
  });

  const pipeline = live.reduce((s, o) => s + Number(o.total), 0);
  return {
    total: orders.length,
    pipeline,
    delivered: delivered.reduce((s, o) => s + Number(o.total), 0),
    aov: live.length ? pipeline / live.length : 0,
    confirmRate: orders.length ? confirmedLike / orders.length : 0,
    deliveryRate: shippedOrDone ? delivered.length / shippedOrDone : 0,
    returnRate: shippedOrDone ? (byStatus["returned"] || 0) / shippedOrDone : 0,
    byStatus,
    perDay: [...perDayMap.entries()].map(([day, v]) => ({ day, ...v })),
    topProducts: [...prod.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.units - a.units).slice(0, 6),
    topCities: [...cities.entries()].map(([city, orders]) => ({ city, orders })).sort((a, b) => b.orders - a.orders).slice(0, 8),
    sources: [...src.entries()].map(([source, v]) => ({ source, ...v })).sort((a, b) => b.orders - a.orders).slice(0, 8)
  };
}

export type Customer = { phone: string; name: string; city: string; orders: number; delivered: number; spent: number; last: string };

export async function listCustomers(q = ""): Promise<Customer[]> {
  const { orders } = await listOrders({ limit: 5000, q });
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const c = map.get(o.phone) || { phone: o.phone, name: o.customer_name, city: o.city, orders: 0, delivered: 0, spent: 0, last: o.created_at };
    c.orders += 1;
    if (o.status === "delivered") {
      c.delivered += 1;
      c.spent += Number(o.total);
    }
    if (o.created_at > c.last) {
      c.last = o.created_at;
      c.name = o.customer_name;
      c.city = o.city;
    }
    map.set(o.phone, c);
  }
  return [...map.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
}

export type ProductSales = {
  id: string;
  slug: string;
  name: string;
  image: string;
  stock: number | null;
  price: number;
  orders: number;
  units: number;
  revenue: number; // non-cancelled, non-returned
  delivered: number; // cash collected
  pending: number; // new + confirmed + shipped
  lostUnits: number; // cancelled + returned
  share: number; // share of total revenue
  perDay: number[]; // units per day, oldest first
};

/** Sales per product from our own orders (cancelled / returned are excluded from revenue). */
export async function computeProductSales(days: number): Promise<{ rows: ProductSales[]; totals: { units: number; revenue: number; delivered: number; orders: number } }> {
  const { orders } = await listOrders({ days, limit: 5000 });
  const { getProducts } = await import("./data");
  const catalog = await getProducts({ all: true });
  const dead = new Set(["cancelled", "returned"]);
  const span = Math.min(days, 90);
  const dayIndex = (iso: string) => span - 1 - Math.floor((Date.now() - Date.parse(iso)) / 86400000);

  const map = new Map<string, ProductSales>();
  const ensure = (id: string, slug: string, name: string, image = "") => {
    let r = map.get(id);
    if (!r) {
      const cp = catalog.find((p) => p.id === id || p.slug === slug);
      r = { id, slug, name: cp?.name_fr || name, image: cp?.images?.[0] || image, stock: cp ? cp.stock : null, price: cp ? Number(cp.price) : 0, orders: 0, units: 0, revenue: 0, delivered: 0, pending: 0, lostUnits: 0, share: 0, perDay: Array(span).fill(0) };
      map.set(id, r);
    }
    return r;
  };
  for (const p of catalog) ensure(p.id, p.slug, p.name_fr, p.images?.[0]);

  for (const o of orders) {
    for (const it of o.items) {
      const r = ensure(it.product_id, it.slug, it.name, it.image);
      if (dead.has(o.status)) {
        r.lostUnits += it.qty;
        continue;
      }
      r.orders += 1;
      r.units += it.qty;
      r.revenue += it.line_total;
      if (o.status === "delivered") r.delivered += it.line_total;
      else r.pending += it.line_total;
      const di = dayIndex(o.created_at);
      if (di >= 0 && di < span) r.perDay[di] += it.qty;
    }
  }
  const rows = [...map.values()].sort((a, b) => b.revenue - a.revenue || b.units - a.units);
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  rows.forEach((r) => (r.share = revenue ? r.revenue / revenue : 0));
  return {
    rows,
    totals: { units: rows.reduce((s, r) => s + r.units, 0), revenue, delivered: rows.reduce((s, r) => s + r.delivered, 0), orders: orders.filter((o) => !dead.has(o.status)).length }
  };
}
