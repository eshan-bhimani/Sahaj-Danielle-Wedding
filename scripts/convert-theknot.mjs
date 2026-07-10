/*
 * Convert a The Knot guest-list export (people.csv) into:
 *   - scripts/guest-list.csv     import format for import-guests.mjs
 *   - scripts/import.sql         direct SQL (same data) for one-shot import
 *   - scripts/invite-codes.csv   household -> invite code mapping
 *
 * Grouping: consecutive rows with the same "Party" value form one
 * household. The same party NAME reappearing later in the file (e.g.
 * several distinct "Khanwani Family" groups) starts a NEW household.
 *
 * Primary guest: first member of the household with a phone number,
 * otherwise the first member listed.
 *
 * Invited events: every household is invited to all three events
 * (The Knot export tracks RSVPs for all events for all guests).
 * Adjust invited_* flags per household in Supabase afterwards if needed.
 *
 * Usage: node scripts/convert-theknot.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

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

const rows = parseCsv(readFileSync(join(dir, "people.csv"), "utf8"));
const header = rows.shift();
const col = (name) => header.indexOf(name);
const FIRST = col("First Name"), LAST = col("Last Name"),
  PARTY = col("Party"), PHONE = col("Phone"), ADDR = col("Street Address 1");
if (FIRST < 0 || LAST < 0 || PARTY < 0) {
  console.error("Unexpected header — is this a The Knot export?");
  process.exit(1);
}

/* Group contiguous runs of the same Party value */
const households = [];
let current = null;
for (const r of rows) {
  const party = r[PARTY].trim();
  const name = `${r[FIRST].trim()} ${r[LAST].trim()}`.replace(/\s+/g, " ");
  if (!party || !name.trim()) { console.error("Skipping row:", r); continue; }
  const phone = (r[PHONE] ?? "").trim();
  const addr = (r[ADDR] ?? "").trim();
  // Same party NAME can cover several real households (the export has
  // multiple distinct "Khanwani Family" groups). Split a same-name run
  // when a row introduces contact info: either a second phone number,
  // or a phone/address appearing after members that had neither.
  const hasContact = phone !== "" || addr !== "";
  const runHasPhone = current?.guests.some((g) => g.phone !== "");
  const runHasContact = current?.guests.some((g) => g.phone !== "" || g.addr !== "");
  const startsNewGroup =
    (phone !== "" && runHasPhone) || (hasContact && current && !runHasContact);
  if (!current || current.name !== party || startsNewGroup) {
    current = { name: party, guests: [] };
    households.push(current);
  }
  current.guests.push({ name, phone, addr });
}

for (const h of households) {
  const primaryIdx = Math.max(0, h.guests.findIndex((g) => g.phone !== ""));
  h.guests.forEach((g, i) => (g.isPrimary = i === primaryIdx));
}

const totalGuests = households.reduce((n, h) => n + h.guests.length, 0);
console.log(`${households.length} households / ${totalGuests} guests`);

const dupNames = new Map();
for (const h of households) dupNames.set(h.name, (dupNames.get(h.name) ?? 0) + 1);
for (const [name, n] of dupNames) {
  if (n > 1) console.log(`note: party name "${name}" appears as ${n} separate households`);
}

/* ---------- guest-list.csv ---------- */
const q = (s) => `"${s.replaceAll('"', '""')}"`;
const csvLines = ["household,guest,is_primary,welcome_party,mehndi,wedding_day"];
for (const h of households) {
  for (const g of h.guests) {
    csvLines.push(`${q(h.name)},${q(g.name)},${g.isPrimary ? "yes" : "no"},yes,yes,yes`);
  }
}
writeFileSync(join(dir, "guest-list.csv"), csvLines.join("\n") + "\n");

/* ---------- invite codes ---------- */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const used = new Set();
const makeCode = () => {
  let c;
  do {
    c = Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
  } while (used.has(c));
  used.add(c);
  return c;
};
for (const h of households) h.code = makeCode();
writeFileSync(
  join(dir, "invite-codes.csv"),
  "household,primary_guest,invite_code\n" +
    households
      .map((h) => `${q(h.name)},${q(h.guests.find((g) => g.isPrimary).name)},${h.code}`)
      .join("\n") + "\n",
);

/* ---------- import.sql ---------- */
const esc = (s) => s.replaceAll("'", "''");
const stmts = households.map((h) => {
  const guestRows = h.guests
    .map((g, i) => `select id, '${esc(g.name)}', ${g.isPrimary}, ${i} from h`)
    .join("\nunion all ");
  return `with h as (
  insert into public.households (name, invite_code, invited_welcome_party, invited_mehndi, invited_wedding_day)
  values ('${esc(h.name)}', '${h.code}', true, true, true) returning id
)
insert into public.guests (household_id, full_name, is_primary, sort_order)
${guestRows};`;
});
writeFileSync(join(dir, "import.sql"), stmts.join("\n\n") + "\n");

console.log("wrote guest-list.csv, invite-codes.csv, import.sql");
