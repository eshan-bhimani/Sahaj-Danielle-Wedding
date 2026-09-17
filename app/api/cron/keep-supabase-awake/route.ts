import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Supabase keepalive skipped: CRON_SECRET is not configured");
    return Response.json({ ok: false }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  // Supabase evaluates Free-plan activity from real database queries. Run a
  // few harmless searches daily so the RSVP database remains active even
  // when no guests visit the site that week.
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const { error } = await getSupabase().rpc("search_rsvp_households", {
      p_query: `__wedding_rsvp_keepalive_${attempt}__`,
    });

    if (error) {
      console.error("Supabase keepalive failed:", error.message);
      return Response.json({ ok: false }, { status: 503 });
    }
  }

  return Response.json({ ok: true });
}
