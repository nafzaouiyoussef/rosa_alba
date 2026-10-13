import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Server-side only (service role). Returns null when env vars are missing (demo mode). */
export function db(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        // Next.js caches fetch() by default; we always want live data.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" })
      }
    });
  }
  return client;
}

export const isDemoMode = () => !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
