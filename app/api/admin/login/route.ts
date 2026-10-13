import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { ADMIN_COOKIE, signAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const sha = (s: string) => createHash("sha256").update(s).digest();

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD is not set on the server." }, { status: 500 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  const ok = timingSafeEqual(sha(String(password || "")), sha(expected));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600)); // slow down brute force
    return NextResponse.json({ ok: false, error: "Mot de passe incorrect" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await signAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
  return res;
}
