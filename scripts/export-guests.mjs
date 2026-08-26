/*
 * Regenerate scripts/guest-list.csv from the database.
 *
 * Supabase is the source of truth for the guest list — the CSV is only an
 * offline copy (and a re-import artifact). This script rewrites it so the
 * two always match. Run it after ANY change to households/guests; the
 * PostToolUse hook in .claude/settings.json does that automatically after
 * every Supabase MCP write.
 *
 * Usage:
 *   node --env-file=.env.local scripts/export-guests.mjs
 *   node --env-file=.env.local scripts/export-guests.mjs --check
 *
 *   --check  exit 1 if the file on disk is out of date, write nothing
 *
 * Reads through the admin_guest_list RPC (gated by ADMIN_REPORT_KEY), so
 * it needs only the keys already in .env.local — no service_role key.
 * Output columns match what scripts/import-guests.mjs expects, so an
 * export/import round-trip is lossless.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "guest-list.csv");
const HEADER = "household,guest,is_primary,welcome_party,mehndi,wedding_day";
const check = process.argv.includes("--check");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const adminKey = process.env.ADMIN_REPORT_KEY;
if (!url || !key || !adminKey) {
  console.error(
    "Missing SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY or ADMIN_REPORT_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/export-guests.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await supabase.rpc("admin_guest_list", { p_key: adminKey });
if (error) {
  console.error("Export failed:", error.message);
  process.exit(1);
}
if (!data) {
  console.error("Export failed: the database rejected ADMIN_REPORT_KEY.");
  process.exit(1);
}
if (data.length === 0) {
  /* Never truncate the only offline copy of the list on an empty read. */
  console.error("Export failed: the database returned no guests. Refusing to overwrite the CSV.");
  process.exit(1);
}

/* Quote every field the same way the importer's parser expects. */
const quote = (v) => `"${String(v).replaceAll('"', '""')}"`;
const yn = (v) => (v ? "yes" : "no");

const lines = [HEADER];
for (const r of data) {
  lines.push(
    [
      quote(r.household),
      quote(r.guest),
      yn(r.is_primary),
      yn(r.welcome_party),
      yn(r.mehndi),
      yn(r.wedding_day),
    ].join(","),
  );
}
const csv = lines.join("\n") + "\n";

/* The importer groups by CONTIGUOUS household name, so several distinct
 * households sharing a display name (there are four "Khanwani Family"s)
 * only survive a re-import while they stay non-adjacent. The RPC's
 * created_at ordering keeps them apart today, but that's luck rather
 * than a guarantee — so count the runs the importer would see and refuse
 * to write a file that would silently merge two households. */
let households = 0;
let previousName = null;
for (const r of data) {
  if (r.household !== previousName) households++;
  previousName = r.household;
}
const collisions = [];
for (let i = 1; i < data.length; i++) {
  if (
    data[i].household === data[i - 1].household &&
    data[i].is_primary &&
    data[i - 1].guest !== data[i].guest
  ) {
    collisions.push(data[i].household);
  }
}
if (collisions.length > 0) {
  console.error(
    "Export aborted: these households would merge on re-import because two\n" +
      "distinct households share a display name and landed on adjacent rows:\n  " +
      [...new Set(collisions)].join("\n  ") +
      "\nRename one of them in the database, then rerun.",
  );
  process.exit(1);
}
const previous = (() => {
  try {
    return readFileSync(OUT, "utf8");
  } catch {
    return null;
  }
})();

if (previous === csv) {
  console.log(`guest-list.csv already matches the database (${households} households / ${data.length} guests).`);
  process.exit(0);
}

if (check) {
  console.error("guest-list.csv is out of date. Run: node --env-file=.env.local scripts/export-guests.mjs");
  process.exit(1);
}

writeFileSync(OUT, csv);
const delta = previous === null ? "created" : `was ${previous.trim().split("\n").length - 1} guest rows`;
console.log(`Wrote guest-list.csv — ${households} households / ${data.length} guests (${delta}).`);
