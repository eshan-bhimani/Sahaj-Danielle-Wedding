import { fetchAdminReport, isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const csvField = (v: string | null) =>
  v == null ? "" : `"${v.replaceAll('"', '""')}"`;

export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const report = await fetchAdminReport();
  if (!report) {
    return new Response("Report unavailable", { status: 500 });
  }

  const header =
    "household,guest,welcome_party,mehndi,wedding_day,food_allergies,notes,email,responded_at,invite_code";
  const lines = report.rows.map((r) =>
    [
      csvField(r.household),
      csvField(r.guest),
      csvField(r.welcome_party),
      csvField(r.mehndi),
      csvField(r.wedding_day),
      csvField(r.food_allergies),
      csvField(r.notes),
      csvField(r.email),
      csvField(r.responded_at),
      csvField(r.invite_code),
    ].join(","),
  );

  const today = new Date().toISOString().slice(0, 10);
  return new Response([header, ...lines].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvp-report-${today}.csv"`,
    },
  });
}
