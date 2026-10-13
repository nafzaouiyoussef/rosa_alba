import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Public: fresh prices for cart lines (?ids=a,b,c). */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").filter(Boolean).slice(0, 20);
  if (!ids.length) return NextResponse.json([]);
  const ps = await getProductsByIds(ids);
  return NextResponse.json(
    ps.filter((p) => p.is_active).map((p) => ({ id: p.id, price: Number(p.price), disc_2: Number(p.disc_2), disc_3: Number(p.disc_3) }))
  );
}
