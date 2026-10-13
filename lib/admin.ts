import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "./auth";

/** Defense in depth: every admin server action / route re-checks the session cookie. */
export async function requireAdmin() {
  const ok = await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) throw new Error("Unauthorized");
}
