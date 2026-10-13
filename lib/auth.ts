import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "ra_admin";

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || "";
  return new TextEncoder().encode(s || "dev-only-secret-change-me-please-32chars");
}

export async function signAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function verifyAdminToken(token?: string | null) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
