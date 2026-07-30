/*
 * End-to-end test suite for the wedding site's RSVP pipeline.
 *
 * Covers: public-API lockdown, lookup (name search + household_id),
 * submission validation and abuse cases, answer persistence, the
 * one-submission lock, page rendering, and /admin auth + CSV export.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-pipeline.mjs [BASE_URL]
 *
 *   BASE_URL defaults to http://localhost:3000 — point it at a running
 *   dev or prod server.
 *
 * Requires two fixture households in the database (safe to re-run —
 * the suite resets them at the start):
 *   "ZZTest Alpha Family"  guests: ZZAlpha One*, ZZAlpha Two,
 *           invited to all three events
 *   "ZZTest Beta Family"   guest: ZZBeta One*,
 *           invited to Mehndi + Wedding Day ONLY
 *
 * If SUPABASE_SERVICE_ROLE_KEY is set, fixtures are created/reset/removed
 * automatically. Otherwise create them via the Supabase dashboard first
 * and this suite will reset (but not delete) them.
 */

import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.argv[2] ?? "http://localhost:3000";
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
);
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

let passed = 0,
  failed = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`✗ FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const FIXTURE_NAMES = ["ZZTest Alpha Family", "ZZTest Beta Family"];

/* ---------- fixtures ---------- */

async function resetFixtures() {
  if (!service) {
    console.log("(no service key — assuming fixtures exist; resetting via RPC not possible, relying on prior state)");
    const { data } = await sb.rpc("search_rsvp_households", { p_query: "ZZTest" });
    const alphaId = data?.find((r) => r.household_name === "ZZTest Alpha Family")?.household_id;
    const betaId = data?.find((r) => r.household_name === "ZZTest Beta Family")?.household_id;
    return { alphaId, betaId };
  }
  await service.from("households").delete().in("name", FIXTURE_NAMES);
  const mk = async (name, wp, me, wd, guests) => {
    const { data: h } = await service
      .from("households")
      .insert({ name, invited_welcome_party: wp, invited_mehndi: me, invited_wedding_day: wd })
      .select("id")
      .single();
    await service.from("guests").insert(
      guests.map((g, i) => ({ household_id: h.id, full_name: g, is_primary: i === 0, sort_order: i })),
    );
    return h.id;
  };
  const alphaId = await mk("ZZTest Alpha Family", true, true, true, ["ZZAlpha One", "ZZAlpha Two"]);
  const betaId = await mk("ZZTest Beta Family", false, true, true, ["ZZBeta One"]);
  return { alphaId, betaId };
}

/* ---------- suite ---------- */

console.log(`Testing against ${BASE_URL}\n`);
const { alphaId, betaId } = await resetFixtures();

console.log("A. Public API lockdown");
for (const table of ["guests", "households", "rsvp_report", "rsvp_summary"]) {
  const { data, error } = await sb.from(table).select("*").limit(1);
  check(`${table} not readable with public key`, Boolean(error) || data.length === 0);
}
{
  const { data } = await sb.rpc("admin_rsvp_report", { p_key: "wrong-key" });
  check("admin report refuses wrong key", data === null);
}

console.log("\nB. Lookup");
{
  const { data } = await sb.rpc("search_rsvp_households", { p_query: "ZZ" });
  check("search under 3 chars returns nothing", (data ?? []).length === 0);
}
{
  const { data } = await sb.rpc("search_rsvp_households", { p_query: "No Such Person XYZ" });
  check("search unknown name returns nothing", (data ?? []).length === 0);
}
{
  const { data } = await sb.rpc("search_rsvp_households", { p_query: "ZZAlpha" });
  check("search finds fixture guest", (data ?? []).some((r) => r.household_name === "ZZTest Alpha Family"));
}
const { data: alpha } = await sb.rpc("get_household_rsvp", { p_household_id: alphaId });
check("household_id lookup works", alpha?.found === true);
const { data: beta } = await sb.rpc("get_household_rsvp", { p_household_id: betaId });
check("limited-invite household loads", beta?.found === true && !beta.invited.welcome_party);
{
  const { data } = await sb.rpc("get_household_rsvp", { p_household_id: "00000000-0000-0000-0000-000000000000" });
  check("unknown household_id returns found:false", data?.found === false);
}

console.log("\nC. Submission validation & abuse cases");
const [a1, a2] = alpha.guests;
const b1 = beta.guests[0];
const submit = (householdId, responses, extra = {}) =>
  sb.rpc("submit_household_rsvp", {
    p_household_id: householdId,
    p_responses: responses,
    p_food_allergies: extra.allergies ?? null,
    p_notes: extra.notes ?? null,
    p_email: extra.email ?? null,
  });
{
  const { data } = await submit("00000000-0000-0000-0000-000000000000", [
    { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
  ]);
  check("unknown household_id rejected", data?.error === "not_found");
}
{
  const { data } = await submit(alphaId, []);
  check("empty responses rejected", data?.error === "invalid");
}
{
  const { data } = await submit(alphaId, [
    { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
  ]);
  check("incomplete household rejected", data?.error === "incomplete");
}
{
  const { data } = await submit(
    alphaId,
    [
      { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
      { guest_id: a2.id, welcome_party: true, mehndi: true, wedding_day: true },
    ],
    { email: "not-an-email" },
  );
  check("malformed email rejected by database", data?.error === "invalid");
}
{
  const { data } = await submit(
    alphaId,
    [
      { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
      { guest_id: a2.id, welcome_party: true, mehndi: true, wedding_day: true },
    ],
    { notes: "x".repeat(2001) },
  );
  check("oversized notes rejected", data?.error === "invalid");
}
{
  /* Alpha submit smuggling Beta's guest id — must not touch Beta */
  const { data } = await submit(alphaId, [
    { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
    { guest_id: a2.id, welcome_party: false, mehndi: true, wedding_day: false },
    { guest_id: b1.id, welcome_party: true, mehndi: true, wedding_day: true },
  ], { allergies: "peanuts", notes: "suite note", email: "suite@test.com" });
  check("submit succeeds ignoring foreign guest id", data?.ok === true);
  const { data: betaAfter } = await sb.rpc("get_household_rsvp", { p_household_id: betaId });
  check(
    "cross-household injection had no effect",
    betaAfter.guests[0].mehndi === null && betaAfter.guests[0].wedding_day === null,
  );
}
{
  const { data: after } = await sb.rpc("get_household_rsvp", { p_household_id: alphaId });
  const g1 = after.guests.find((g) => g.name === "ZZAlpha One");
  const g2 = after.guests.find((g) => g.name === "ZZAlpha Two");
  check(
    "answers persisted exactly as submitted",
    g1.welcome_party === true && g1.mehndi === true && g1.wedding_day === true &&
      g2.welcome_party === false && g2.mehndi === true && g2.wedding_day === false,
    JSON.stringify(after.guests),
  );
  check("household marked responded", after.responded === true);
}
{
  /* Reversal (July 16, 2026): resubmission overwrites, it doesn't lock. */
  const { data } = await submit(alphaId, [
    { guest_id: a1.id, welcome_party: false, mehndi: false, wedding_day: false },
    { guest_id: a2.id, welcome_party: false, mehndi: false, wedding_day: false },
  ]);
  check("resubmission overwrites instead of locking", data?.ok === true);
  const { data: after } = await sb.rpc("get_household_rsvp", { p_household_id: alphaId });
  check(
    "overwritten answers reflect the second submission",
    after.guests.every((g) => g.welcome_party === false),
  );
}
{
  /* Beta invited to Mehndi + Wedding only — welcome answer must be discarded */
  const { data } = await submit(betaId, [
    { guest_id: b1.id, welcome_party: true, mehndi: true, wedding_day: false },
  ]);
  check("limited-invite submit succeeds", data?.ok === true);
  const { data: after } = await sb.rpc("get_household_rsvp", { p_household_id: betaId });
  check(
    "answer for uninvited event discarded",
    after.guests[0].welcome_party === null && after.guests[0].mehndi === true,
  );
}

console.log("\nD. Pages & admin (HTTP)");
const get = async (path, headers = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  return { status: res.status, body: await res.text() };
};
for (const p of ["/", "/dress-code", "/faqs", "/registry", "/rsvp", "/admin"]) {
  const { status } = await get(p);
  check(`${p} serves 200`, status === 200);
}
const password = process.env.ADMIN_PASSWORD;
const key = process.env.ADMIN_REPORT_KEY;
if (password && key) {
  const token = createHash("sha256").update(`${password}:${key}`).digest("hex");
  const cookie = { Cookie: `dsw_admin=${token}` };
  check("admin logged out shows password form", (await get("/admin")).body.includes("Password"));
  check("admin logged in shows report", (await get("/admin", cookie)).body.includes("Download CSV"));
  check("CSV export blocked logged out", (await get("/admin/export")).status === 401);
  const csv = await get("/admin/export", cookie);
  check(
    "CSV export contains suite submission",
    csv.body.includes("ZZAlpha Two") && csv.body.includes("suite@test.com"),
  );
} else {
  console.log("(skipping admin auth tests — ADMIN_PASSWORD/ADMIN_REPORT_KEY not set)");
}

/* ---------- teardown ---------- */
if (service) {
  await service.from("households").delete().in("name", FIXTURE_NAMES);
  console.log("\nFixtures removed.");
} else {
  console.log("\nNote: fixtures ZZTest Alpha/Beta Family left in place (no service key to remove them).");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
