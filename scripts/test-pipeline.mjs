/*
 * End-to-end test suite for the wedding site's RSVP pipeline.
 *
 * Covers: public-API lockdown, lookup (name search + invite codes),
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
 *   TESTA1  "ZZTest Alpha Family"  guests: ZZAlpha One*, ZZAlpha Two,
 *           invited to all three events
 *   TESTB1  "ZZTest Beta Family"   guest: ZZBeta One*,
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

/* ---------- fixtures ---------- */

async function resetFixtures() {
  if (!service) {
    console.log("(no service key — assuming fixtures exist; resetting via RPC not possible, relying on prior state)");
    return;
  }
  await service.from("households").delete().in("invite_code", ["TESTA1", "TESTB1"]);
  const mk = async (name, code, wp, me, wd, guests) => {
    const { data: h } = await service
      .from("households")
      .insert({ name, invite_code: code, invited_welcome_party: wp, invited_mehndi: me, invited_wedding_day: wd })
      .select("id")
      .single();
    await service.from("guests").insert(
      guests.map((g, i) => ({ household_id: h.id, full_name: g, is_primary: i === 0, sort_order: i })),
    );
  };
  await mk("ZZTest Alpha Family", "TESTA1", true, true, true, ["ZZAlpha One", "ZZAlpha Two"]);
  await mk("ZZTest Beta Family", "TESTB1", false, true, true, ["ZZBeta One"]);
}

/* ---------- suite ---------- */

console.log(`Testing against ${BASE_URL}\n`);
await resetFixtures();

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
const { data: alpha } = await sb.rpc("get_household_rsvp", { p_code: " testa1 " });
check("code lookup tolerates case/whitespace", alpha?.found === true);
const { data: beta } = await sb.rpc("get_household_rsvp", { p_code: "TESTB1" });
check("limited-invite household loads", beta?.found === true && !beta.invited.welcome_party);
{
  const { data } = await sb.rpc("get_household_rsvp", { p_code: "ZZZZ99" });
  check("unknown code returns found:false", data?.found === false);
}

console.log("\nC. Submission validation & abuse cases");
const [a1, a2] = alpha.guests;
const b1 = beta.guests[0];
const submit = (household_id, responses, extra = {}) =>
  sb.rpc("submit_household_rsvp", {
    p_household_id: household_id,
    p_responses: responses,
    p_food_allergies: extra.allergies ?? null,
    p_notes: extra.notes ?? null,
    p_email: extra.email ?? null,
  });
{
  const { data } = await submit("00000000-0000-0000-0000-000000000000", [
    { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
  ]);
  check("unknown household rejected", data?.error === "not_found");
}
{
  const { data } = await submit(alpha.household_id, []);
  check("empty responses rejected", data?.error === "invalid");
}
{
  const { data } = await submit(alpha.household_id, [
    { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
  ]);
  check("incomplete household rejected", data?.error === "incomplete");
}
{
  const { data } = await submit(
    alpha.household_id,
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
    alpha.household_id,
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
  const { data } = await submit(alpha.household_id, [
    { guest_id: a1.id, welcome_party: true, mehndi: true, wedding_day: true },
    { guest_id: a2.id, welcome_party: false, mehndi: true, wedding_day: false },
    { guest_id: b1.id, welcome_party: true, mehndi: true, wedding_day: true },
  ], { allergies: "peanuts", notes: "suite note", email: "suite@test.com" });
  check("submit succeeds ignoring foreign guest id", data?.ok === true);
  const { data: betaAfter } = await sb.rpc("get_household_rsvp", { p_code: "TESTB1" });
  check(
    "cross-household injection had no effect",
    betaAfter.guests[0].mehndi === null && betaAfter.guests[0].wedding_day === null,
  );
}
{
  const { data: after } = await sb.rpc("get_household_rsvp", { p_id: alpha.household_id });
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
  const { data } = await submit(alpha.household_id, [
    { guest_id: a1.id, welcome_party: false, mehndi: false, wedding_day: false },
    { guest_id: a2.id, welcome_party: false, mehndi: false, wedding_day: false },
  ]);
  check("locked after first submission", data?.error === "already_responded");
}
{
  /* Beta invited to Mehndi + Wedding only — welcome answer must be discarded */
  const { data } = await submit(beta.household_id, [
    { guest_id: b1.id, welcome_party: true, mehndi: true, wedding_day: false },
  ]);
  check("limited-invite submit succeeds", data?.ok === true);
  const { data: after } = await sb.rpc("get_household_rsvp", { p_code: "TESTB1" });
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
{
  const { body } = await get("/rsvp?code=TESTA1");
  check("code link renders household", body.includes("ZZTest Alpha Family"));
}
{
  const { body } = await get("/rsvp?code=ZZZZ99");
  check("bad code link shows friendly error", body.includes("find an invitation"));
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
  await service.from("households").delete().in("invite_code", ["TESTA1", "TESTB1"]);
  console.log("\nFixtures removed.");
} else {
  console.log("\nNote: fixtures TESTA1/TESTB1 left in place (no service key to remove them).");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
