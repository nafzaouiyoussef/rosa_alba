"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_SETTINGS, type Order, type OrderStatus, type Settings } from "@/lib/types";

type Result = { ok: boolean; error?: string; id?: string };

function client() {
  const c = db();
  if (!c) throw new Error("Supabase n'est pas configuré (variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  return c;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const lines = (v: unknown): string[] =>
  (Array.isArray(v) ? v : String(v || "").split("\n")).map((x) => String(x).trim()).filter(Boolean);

/* ---------------- Products ---------------- */
export async function saveProduct(input: Record<string, any>): Promise<Result> {
  try {
    await requireAdmin();
    const c = client();
    const row = {
      slug: slugify(String(input.slug || input.name_fr || "")),
      name_fr: String(input.name_fr || "").trim(),
      name_ar: String(input.name_ar || "").trim(),
      tagline_fr: String(input.tagline_fr || "").trim(),
      tagline_ar: String(input.tagline_ar || "").trim(),
      description_fr: String(input.description_fr || "").trim(),
      description_ar: String(input.description_ar || "").trim(),
      benefits_fr: lines(input.benefits_fr),
      benefits_ar: lines(input.benefits_ar),
      ingredients_fr: String(input.ingredients_fr || "").trim(),
      ingredients_ar: String(input.ingredients_ar || "").trim(),
      usage_fr: String(input.usage_fr || "").trim(),
      usage_ar: String(input.usage_ar || "").trim(),
      size: String(input.size || "").trim(),
      price: Math.max(0, Number(input.price) || 0),
      compare_at_price: input.compare_at_price === "" || input.compare_at_price == null ? null : Math.max(0, Number(input.compare_at_price) || 0),
      disc_2: Math.min(90, Math.max(0, Number(input.disc_2) || 0)),
      disc_3: Math.min(90, Math.max(0, Number(input.disc_3) || 0)),
      stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
      images: lines(input.images),
      category: String(input.category || "").trim(),
      is_active: !!input.is_active,
      is_featured: !!input.is_featured,
      sort_order: Math.floor(Number(input.sort_order) || 0),
      updated_at: new Date().toISOString()
    };
    if (!row.name_fr || !row.slug) return { ok: false, error: "Le nom (FR) est obligatoire." };

    if (input.id) {
      const { error } = await c.from("products").update(row).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/", "layout");
      return { ok: true, id: input.id };
    }
    const { data, error } = await c.from("products").insert(row).select("id").single();
    if (error) return { ok: false, error: error.message.includes("duplicate") ? "Ce slug existe déjà." : error.message };
    revalidatePath("/", "layout");
    return { ok: true, id: data.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteProduct(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const { error } = await client().from("products").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function quickUpdateProduct(id: string, patch: { price?: number; stock?: number; is_active?: boolean }): Promise<Result> {
  try {
    await requireAdmin();
    const upd: Record<string, any> = { updated_at: new Date().toISOString() };
    if (patch.price !== undefined) upd.price = Math.max(0, Number(patch.price) || 0);
    if (patch.stock !== undefined) upd.stock = Math.max(0, Math.floor(Number(patch.stock) || 0));
    if (patch.is_active !== undefined) upd.is_active = !!patch.is_active;
    const { error } = await client().from("products").update(upd).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

/* ---------------- Orders ---------------- */
const INACTIVE: OrderStatus[] = ["cancelled", "returned"];

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Result> {
  try {
    await requireAdmin();
    const c = client();
    const { data } = await c.from("orders").select("*").eq("id", id).maybeSingle();
    const order = data as Order | null;
    if (!order) return { ok: false, error: "Commande introuvable" };

    const wasInactive = INACTIVE.includes(order.status);
    const willBeInactive = INACTIVE.includes(status);
    if (wasInactive !== willBeInactive) {
      // put stock back on cancel/return, take it again if the order is reactivated
      const sign = willBeInactive ? 1 : -1;
      for (const it of order.items) {
        const { data: p } = await c.from("products").select("stock").eq("id", it.product_id).maybeSingle();
        if (p) await c.from("products").update({ stock: Math.max(0, p.stock + sign * it.qty) }).eq("id", it.product_id);
      }
    }
    const { error } = await c.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function saveOrderNotes(id: string, admin_notes: string): Promise<Result> {
  try {
    await requireAdmin();
    const { error } = await client().from("orders").update({ admin_notes: admin_notes.slice(0, 2000), updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateOrderCustomer(
  id: string,
  patch: { customer_name: string; phone: string; city: string; address: string }
): Promise<Result> {
  try {
    await requireAdmin();
    const { error } = await client()
      .from("orders")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

/* ---------------- Reviews ---------------- */
export async function saveReview(input: {
  product_id: string | null;
  author: string;
  city: string;
  rating: number;
  body: string;
  is_approved: boolean;
}): Promise<Result> {
  try {
    await requireAdmin();
    if (!input.author.trim() || !input.body.trim()) return { ok: false, error: "Nom et avis obligatoires." };
    const { error } = await client()
      .from("reviews")
      .insert({
        product_id: input.product_id || null,
        author: input.author.trim().slice(0, 80),
        city: input.city.trim().slice(0, 60),
        rating: Math.max(1, Math.min(5, Math.floor(input.rating) || 5)),
        body: input.body.trim().slice(0, 800),
        is_approved: input.is_approved
      });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function toggleReview(id: string, is_approved: boolean): Promise<Result> {
  try {
    await requireAdmin();
    const { error } = await client().from("reviews").update({ is_approved }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteReview(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const { error } = await client().from("reviews").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

/* ---------------- Settings ---------------- */
export async function saveSettings(input: Partial<Settings>): Promise<Result> {
  try {
    await requireAdmin();
    const clean = (s: unknown, n = 200) => String(s ?? "").trim().slice(0, n);
    const idOnly = (s: unknown) => clean(s, 40).replace(/[^A-Za-z0-9_-]/g, "");
    const value: Settings = {
      ...DEFAULT_SETTINGS,
      store_name: clean(input.store_name, 60) || "Rosa Alba",
      whatsapp: clean(input.whatsapp, 25),
      instagram: clean(input.instagram, 60).replace(/^@/, ""),
      announcement_fr: clean(input.announcement_fr),
      announcement_ar: clean(input.announcement_ar),
      meta_pixel_id: idOnly(input.meta_pixel_id),
      tiktok_pixel_id: idOnly(input.tiktok_pixel_id),
      ga_id: idOnly(input.ga_id),
      shipping_fee: Math.max(0, Number(input.shipping_fee) || 0),
      delivery_days: clean(input.delivery_days, 30) || "24-72h",
      upsell_enabled: !!input.upsell_enabled,
      bundle_enabled: input.bundle_enabled !== false,
      bundle_discount_pct: Math.min(50, Math.max(0, Number(input.bundle_discount_pct) || 0)),
      upsell_discount_pct: Math.min(50, Math.max(0, Number(input.upsell_discount_pct) || 0)),
      hero_image: clean(input.hero_image, 500),
      contact_email: clean(input.contact_email, 120),
      business_name: clean(input.business_name, 120),
      business_address: clean(input.business_address, 250),
      business_id: clean(input.business_id, 80)
    };
    const { error } = await client().from("settings").upsert({ key: "store", value, updated_at: new Date().toISOString() });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
