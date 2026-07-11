import type { Metadata } from "next";
import { fetchAdminReport, isAdmin } from "@/lib/admin";
import { adminLogin } from "./actions";
import { FloralDivider } from "@/components/Floral";

export const metadata: Metadata = {
  title: "RSVP Report — Danielle & Sahaj",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const answerClasses: Record<string, string> = {
  YES: "font-semibold text-leaf",
  no: "text-ink/50",
  "no response yet": "italic text-ink/40",
  "— not invited": "text-ink/30",
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-blue-pale/60 px-4 py-4 text-center">
      <p className="font-serif text-3xl text-blue-deep">{value}</p>
      <p className="mt-1 text-sm tracking-wide text-ink/70 uppercase">
        {label}
      </p>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  /* ---------- Login ---------- */
  if (!(await isAdmin())) {
    return (
      <section className="px-4 py-24">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="font-serif text-4xl tracking-[0.18em] text-blue-deep uppercase">
            RSVP Report
          </h1>
          <FloralDivider className="my-8" />
          <form action={adminLogin} className="space-y-4">
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              autoFocus
              className="w-full rounded-lg border border-blue/40 bg-white px-4 py-3 text-lg focus:border-blue-deep focus:outline-none focus:ring-2 focus:ring-blue-pale"
            />
            {error && (
              <p role="alert" className="text-poppy">
                Wrong password — try again.
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-blue px-8 py-3 font-serif text-lg tracking-[0.25em] text-white uppercase transition-colors hover:bg-blue-deep"
            >
              Open
            </button>
          </form>
          <p className="mt-6 text-sm text-ink/60">
            For Danielle, Sahaj &amp; Eshan — guests RSVP{" "}
            <a href="/rsvp" className="underline">
              here
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  /* ---------- Report ---------- */
  const report = await fetchAdminReport();
  if (!report) {
    return (
      <section className="px-4 py-24 text-center">
        <p className="text-lg text-poppy">
          Couldn&apos;t load the report — check ADMIN_REPORT_KEY and try again.
        </p>
      </section>
    );
  }
  const { summary, rows } = report;

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h1 className="font-serif text-4xl tracking-[0.18em] text-blue-deep uppercase">
            RSVP Report
          </h1>
          <a
            href="/admin/export"
            className="rounded-full bg-magenta px-6 py-2.5 font-serif text-lg tracking-[0.15em] text-white uppercase transition-colors hover:bg-pink"
          >
            Download CSV
          </a>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Households in"
            value={`${summary.households_responded}/${summary.households_total}`}
          />
          <StatTile label="Welcome Party" value={`${summary.welcome_party_yes}`} />
          <StatTile label="Mehndi" value={`${summary.mehndi_yes}`} />
          <StatTile label="Wedding Day" value={`${summary.wedding_day_yes}`} />
        </div>
        <p className="mt-2 text-sm text-ink/60">
          Event tiles show confirmed &ldquo;yes&rdquo; guest counts. Updates
          live — refresh anytime.
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-blue-pale">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-blue-pale/60 font-serif text-base text-blue-deep">
              <tr>
                <th className="px-4 py-3">Household</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Welcome Party</th>
                <th className="px-4 py-3">Mehndi</th>
                <th className="px-4 py-3">Wedding Day</th>
                <th className="px-4 py-3">Allergies</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Code</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const firstOfHousehold =
                  i === 0 ||
                  rows[i - 1].invite_code !== row.invite_code;
                return (
                  <tr
                    key={`${row.invite_code}-${row.guest}`}
                    className={`border-t ${
                      firstOfHousehold
                        ? "border-blue-pale"
                        : "border-blue-pale/40"
                    } ${row.responded_at ? "" : "bg-gold-pale/30"}`}
                  >
                    <td className="px-4 py-2.5 font-medium">
                      {firstOfHousehold ? row.household : ""}
                    </td>
                    <td className="px-4 py-2.5">{row.guest}</td>
                    {(["welcome_party", "mehndi", "wedding_day"] as const).map(
                      (key) => (
                        <td
                          key={key}
                          className={`px-4 py-2.5 ${answerClasses[row[key]] ?? ""}`}
                        >
                          {row[key]}
                        </td>
                      ),
                    )}
                    <td className="px-4 py-2.5">
                      {firstOfHousehold ? (row.food_allergies ?? "") : ""}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-2.5">
                      {firstOfHousehold ? (row.notes ?? "") : ""}
                    </td>
                    <td className="px-4 py-2.5">
                      {firstOfHousehold ? (row.email ?? "") : ""}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {firstOfHousehold ? row.invite_code : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          Households that haven&apos;t responded yet are shaded. Allergies,
          notes, and email are per household.
        </p>
      </div>
    </section>
  );
}
