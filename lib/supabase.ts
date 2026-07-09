import { createClient } from "@supabase/supabase-js";

/* Server-side client. The publishable key is safe to expose, but since
 * only the RSVP server action talks to Supabase we keep it server-only. */
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY environment variable",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
