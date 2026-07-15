"use server";

import { getSupabase } from "@/lib/supabase";
import { sendGuestConfirmation } from "@/lib/notify";

export type HouseholdMatch = {
  householdId: string;
  householdName: string;
  matchedGuests: string[];
};

export type GuestRsvp = {
  id: string;
  name: string;
  welcomeParty: boolean | null;
  mehndi: boolean | null;
  weddingDay: boolean | null;
};

export type Household = {
  householdId: string;
  name: string;
  invited: { welcomeParty: boolean; mehndi: boolean; weddingDay: boolean };
  responded: boolean;
  foodAllergies: string | null;
  notes: string | null;
  email: string | null;
  guests: GuestRsvp[];
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapHousehold(data: any): Household {
  return {
    householdId: data.household_id,
    name: data.name,
    invited: {
      welcomeParty: data.invited.welcome_party,
      mehndi: data.invited.mehndi,
      weddingDay: data.invited.wedding_day,
    },
    responded: data.responded,
    foodAllergies: data.food_allergies ?? null,
    notes: data.notes ?? null,
    email: data.email ?? null,
    guests: (data.guests ?? []).map((g: any) => ({
      id: g.id,
      name: g.name,
      welcomeParty: g.welcome_party ?? null,
      mehndi: g.mehndi ?? null,
      weddingDay: g.wedding_day ?? null,
    })),
  };
}

export async function searchHouseholds(
  query: string,
): Promise<HouseholdMatch[]> {
  const q = query.trim();
  if (q.length < 3 || q.length > 100) return [];

  const { data, error } = await getSupabase().rpc("search_rsvp_households", {
    p_query: q,
  });
  if (error || !data) {
    if (error) console.error("RSVP search failed:", error.message);
    return [];
  }

  const grouped = new Map<string, HouseholdMatch>();
  for (const row of data as {
    household_id: string;
    household_name: string;
    matched_guest: string;
  }[]) {
    const existing = grouped.get(row.household_id);
    if (existing) {
      existing.matchedGuests.push(row.matched_guest);
    } else {
      grouped.set(row.household_id, {
        householdId: row.household_id,
        householdName: row.household_name,
        matchedGuests: [row.matched_guest],
      });
    }
  }
  return [...grouped.values()];
}

export async function loadHousehold(params: {
  id?: string;
  code?: string;
}): Promise<Household | null> {
  const { data, error } = await getSupabase().rpc("get_household_rsvp", {
    p_id: params.id ?? null,
    p_code: params.code ?? null,
  });
  if (error || !data?.found) {
    if (error) console.error("RSVP load failed:", error.message);
    return null;
  }
  return mapHousehold(data);
}

export async function submitHouseholdRsvp(input: {
  householdId: string;
  responses: {
    guestId: string;
    welcomeParty: boolean | null;
    mehndi: boolean | null;
    weddingDay: boolean | null;
  }[];
  foodAllergies: string;
  notes: string;
  email: string;
}): Promise<SubmitResult> {
  const email = input.email.trim();
  if (email && (email.length > 320 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) {
    return { ok: false, error: "email" };
  }

  const { data, error } = await getSupabase().rpc("submit_household_rsvp", {
    p_household_id: input.householdId,
    p_responses: input.responses.map((r) => ({
      guest_id: r.guestId,
      welcome_party: r.welcomeParty,
      mehndi: r.mehndi,
      wedding_day: r.weddingDay,
    })),
    p_food_allergies: input.foodAllergies.trim() || null,
    p_notes: input.notes.trim() || null,
    p_email: email || null,
  });

  if (error) {
    console.error("RSVP submit failed:", error.message);
    return { ok: false, error: "server" };
  }
  if (!data?.ok) {
    return { ok: false, error: data?.error ?? "server" };
  }

  // Confirmation email to the guest. Never blocks or fails the RSVP —
  // sendGuestConfirmation no-ops when Gmail isn't configured and
  // swallows send errors.
  if (email) {
    const saved = await loadHousehold({ id: input.householdId });
    if (saved) await sendGuestConfirmation(saved, email);
  }

  return { ok: true };
}
