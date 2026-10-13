import { db } from "./supabase";
import { DEFAULT_SETTINGS, type Order, type Product, type Review, type Settings } from "./types";
import seed from "../supabase/seed-products.json";

function seedProducts(): Product[] {
  return (seed as any[]).map((p) => ({
    id: p.slug,
    images: [],
    is_active: true,
    ...p
  })) as Product[];
}

export async function getProducts(opts: { all?: boolean } = {}): Promise<Product[]> {
  const c = db();
  if (!c) return seedProducts();
  let q = c.from("products").select("*").order("sort_order", { ascending: true });
  if (!opts.all) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const c = db();
  if (!c) return seedProducts().find((p) => p.slug === slug) || null;
  const { data } = await c.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  return (data as Product) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const c = db();
  if (!c) return seedProducts().find((p) => p.id === id) || null;
  const { data } = await c.from("products").select("*").eq("id", id).maybeSingle();
  return (data as Product) || null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const c = db();
  if (!c) return seedProducts().filter((p) => ids.includes(p.id));
  const { data } = await c.from("products").select("*").in("id", ids);
  return (data as Product[]) || [];
}

export async function getSettings(): Promise<Settings> {
  const c = db();
  let stored: Partial<Settings> = {};
  if (c) {
    const { data } = await c.from("settings").select("value").eq("key", "store").maybeSingle();
    stored = (data?.value as Partial<Settings>) || {};
  }
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  // env fallbacks for tracking ids
  merged.meta_pixel_id = merged.meta_pixel_id || process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  merged.tiktok_pixel_id = merged.tiktok_pixel_id || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";
  merged.ga_id = merged.ga_id || process.env.NEXT_PUBLIC_GA_ID || "";
  return merged;
}

export async function getReviews(productId?: string | null): Promise<Review[]> {
  const c = db();
  if (!c) return [];
  let q = c.from("reviews").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(30);
  if (productId) q = q.or(`product_id.eq.${productId},product_id.is.null`);
  const { data } = await q;
  return (data as Review[]) || [];
}

export async function getOrderByNumber(num: string): Promise<Order | null> {
  const c = db();
  if (!c) return null;
  const { data } = await c.from("orders").select("*").eq("order_number", num).maybeSingle();
  return (data as Order) || null;
}
