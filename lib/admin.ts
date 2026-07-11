import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { getSupabase } from "./supabase";

/* Auth for the couple's /admin report page.
 *
 * ADMIN_PASSWORD    shared password Eshan/Sahaj/Danielle type to log in
 * ADMIN_REPORT_KEY  server-side key the database requires before it will
 *                   return the report (stored in private.admin_config)
 *
 * The session cookie holds a hash derived from both values, so it can't
 * be forged without knowing them and all sessions can be revoked by
 * changing either.
 */

export const ADMIN_COOKIE = "dsw_admin";

export function adminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  const key = process.env.ADMIN_REPORT_KEY;
  if (!password || !key) return null;
  return createHash("sha256").update(`${password}:${key}`).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === token;
}

export type ReportRow = {
  household: string;
  guest: string;
  welcome_party: string;
  mehndi: string;
  wedding_day: string;
  food_allergies: string | null;
  notes: string | null;
  responded_at: string | null;
  invite_code: string;
  email: string | null;
};

export type ReportSummary = {
  households_responded: number;
  households_total: number;
  welcome_party_yes: number;
  mehndi_yes: number;
  wedding_day_yes: number;
};

export async function fetchAdminReport(): Promise<{
  summary: ReportSummary;
  rows: ReportRow[];
} | null> {
  const key = process.env.ADMIN_REPORT_KEY;
  if (!key) return null;
  const { data, error } = await getSupabase().rpc("admin_rsvp_report", {
    p_key: key,
  });
  if (error || !data) {
    if (error) console.error("Admin report fetch failed:", error.message);
    return null;
  }
  return data;
}
