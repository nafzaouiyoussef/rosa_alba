import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const OK_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif"
};

/** Admin-only image upload to the public Supabase Storage bucket "products". */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const c = db();
  if (!c) return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  const ext = OK_TYPES[file.type];
  if (!ext) return NextResponse.json({ ok: false, error: "Format non supporté (JPG, PNG, WebP)" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Image trop lourde (max 5 Mo)" }, { status: 400 });

  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await c.storage.from("products").upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    cacheControl: "31536000"
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const { data } = c.storage.from("products").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
