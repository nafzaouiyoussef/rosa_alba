import { cookies } from "next/headers";
import type { Lang } from "./types";

/** Server-only: reads the language cookie (default French). */
export function getLang(): Lang {
  const v = cookies().get("lang")?.value;
  return v === "ar" ? "ar" : "fr";
}
