/*
 * Import the wedding guest list into Supabase.
 *
 * CSV format (one row per guest, see scripts/guest-list.sample.csv):
 *   household,guest,is_primary,welcome_party,mehndi,wedding_day
 *
 *   - household:      display name shown on the RSVP page ("The Rahman Family")
 *   - guest:          full name (used for name search)
 *   - is_primary:     yes for the head of household (invitation recipient)
 *   - welcome_party / mehndi / wedding_day: yes/no — which events this
 *     HOUSEHOLD is invited to (read from the first row of each household)
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-guests.mjs guest-list.csv
 *   node --env-file=.env.local scripts/import-guests.mjs guest-list.csv --dry-run
 *   node --env-file=.env.local scripts/import-guests.mjs guest-list.csv --wipe
 *
 *   --dry-run  parse and print what would be imported, write nothing
 *   --wipe     DELETE ALL existing households and guests first (use this
 *              once to clear the sample data before the real import)
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (the guest tables are
 * locked to the public API on purpose). Find it in the Supabase dashboard:
 * Project Settings -> API keys -> service_role. NEVER commit that key.
 *
 * Prints each household's invite code when done — use them for
 * personalized links: https://<your-site>/rsvp?code=XXXXXX
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const wipe = args.includes("--wipe");

if (!csvPath) {
  console.error("Usage: node --env-file=.env.local scripts/import-guests.mjs <file.csv> [--dry-run] [--wipe]");
  process.exit(1);
}

/* ---------- tiny CSV parser (handles quoted fields) ---------- */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const yes = (v) => ["yes", "y", "true", "1"].includes(String(v).trim().toLowerCase());

/* ---------- parse & group ---------- */
const rows = parseCsv(readFileSync(csvPath, "utf8"));
const header = rows.shift().map((h) => h.trim().toLowerCase());
const expected = ["household", "guest", "is_primary", "welcome_party", "mehndi", "wedding_day"];
for (const col of expected) {
  if (!header.includes(col)) {
    console.error(`CSV is missing the "${col}" column. Expected header: ${expected.join(",")}`);
    process.exit(1);
  }
}
const col = Object.fromEntries(expected.map((c) => [c, header.indexOf(c)]));

const households = new Map();
for (const r of rows) {
  const hName = r[col.household]?.trim();
  const gName = r[col.guest]?.trim();
  if (!hName || !gName) {
    console.error(`Skipping malformed row: ${JSON.stringify(r)}`);
    continue;
  }
  if (!households.has(hName)) {
    households.set(hName, {
      name: hName,
      invited_welcome_party: yes(r[col.welcome_party]),
      invited_mehndi: yes(r[col.mehndi]),
      invited_wedding_day: yes(r[col.wedding_day]),
      guests: [],
    });
  }
  const h = households.get(hName);
  h.guests.push({
    full_name: gName,
    is_primary: yes(r[col.is_primary]),
    sort_order: h.guests.length,
  });
}

const totalGuests = [...households.values()].reduce((n, h) => n + h.guests.length, 0);
console.log(`Parsed ${households.size} households / ${totalGuests} guests from ${csvPath}\n`);

for (const h of households.values()) {
  if (!h.guests.some((g) => g.is_primary)) {
    console.warn(`⚠ ${h.name}: no is_primary=yes guest — first guest will be treated as primary.`);
    h.guests[0].is_primary = true;
  }
  if (!h.invited_wedding_day && !h.invited_mehndi && !h.invited_welcome_party) {
    console.error(`✗ ${h.name}: invited to no events. Fix the CSV.`);
    process.exit(1);
  }
}

if (dryRun) {
  for (const h of households.values()) {
    const events = [
      h.invited_welcome_party && "Welcome Party",
      h.invited_mehndi && "Mehndi",
      h.invited_wedding_day && "Wedding Day",
    ].filter(Boolean).join(" + ");
    console.log(`${h.name} [${events}]: ${h.guests.map((g) => g.full_name + (g.is_primary ? "*" : "")).join(", ")}`);
  }
  console.log("\nDry run — nothing written. (* = primary)");
  process.exit(0);
}

/* ---------- write to Supabase ---------- */
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  console.error("Get the service_role key from the Supabase dashboard (Project Settings -> API keys)");
  console.error("and add it to .env.local, then rerun with: node --env-file=.env.local ...");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

/* Unambiguous alphabet: no 0/O/1/I/L */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

if (wipe) {
  console.log("--wipe: deleting ALL existing households and guests…");
  const { error } = await supabase.from("households").delete().not("id", "is", null);
  if (error) { console.error("Wipe failed:", error.message); process.exit(1); }
}

const { data: existing, error: existingErr } = await supabase
  .from("households").select("invite_code");
if (existingErr) { console.error("Failed to read existing codes:", existingErr.message); process.exit(1); }
const usedCodes = new Set((existing ?? []).map((r) => r.invite_code));

const codeList = [];
for (const h of households.values()) {
  let invite_code = makeCode();
  while (usedCodes.has(invite_code)) invite_code = makeCode();
  usedCodes.add(invite_code);

  const { data: inserted, error: hErr } = await supabase
    .from("households")
    .insert({
      name: h.name,
      invite_code,
      invited_welcome_party: h.invited_welcome_party,
      invited_mehndi: h.invited_mehndi,
      invited_wedding_day: h.invited_wedding_day,
    })
    .select("id")
    .single();
  if (hErr) { console.error(`Failed to insert ${h.name}:`, hErr.message); process.exit(1); }

  const { error: gErr } = await supabase
    .from("guests")
    .insert(h.guests.map((g) => ({ ...g, household_id: inserted.id })));
  if (gErr) { console.error(`Failed to insert guests for ${h.name}:`, gErr.message); process.exit(1); }

  codeList.push([h.name, invite_code]);
  console.log(`✓ ${h.name} (${h.guests.length} guests) — code ${invite_code}`);
}

console.log(`\nImported ${codeList.length} households.`);
console.log("\nInvite codes (for personalized links like https://your-site/rsvp?code=CODE):\n");
console.log("household,invite_code");
for (const [name, c] of codeList) console.log(`"${name.replaceAll('"', '""')}",${c}`);
