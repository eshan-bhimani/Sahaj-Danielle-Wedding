"use server";

import { getSupabase } from "@/lib/supabase";

export type RsvpState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitRsvp(
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const attendingRaw = formData.get("attending");
  const attending = attendingRaw === "yes";
  const numGuests = Number(formData.get("num_guests") ?? 1);
  const foodAllergies = String(formData.get("food_allergies") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!guestName) {
    return { status: "error", message: "Please enter your name." };
  }
  if (guestName.length > 200) {
    return { status: "error", message: "Name is too long." };
  }
  if (attendingRaw !== "yes" && attendingRaw !== "no") {
    return {
      status: "error",
      message: "Please let us know whether you can make it.",
    };
  }
  if (
    attending &&
    (!Number.isInteger(numGuests) || numGuests < 1 || numGuests > 10)
  ) {
    return {
      status: "error",
      message: "Number of guests must be between 1 and 10.",
    };
  }
  if (foodAllergies.length > 1000) {
    return { status: "error", message: "Food allergies text is too long." };
  }
  if (notes.length > 2000) {
    return { status: "error", message: "Notes are too long." };
  }

  const row = {
    guest_name: guestName,
    attending,
    num_guests: attending ? numGuests : 1,
    attending_welcome_party: attending && formData.get("event_welcome") === "on",
    attending_mehndi: attending && formData.get("event_mehndi") === "on",
    attending_wedding_day: attending && formData.get("event_wedding") === "on",
    food_allergies: attending && foodAllergies ? foodAllergies : null,
    notes: notes || null,
  };

  const { error } = await getSupabase().from("rsvps").insert(row);

  if (error) {
    console.error("RSVP insert failed:", error.message);
    return {
      status: "error",
      message:
        "Something went wrong saving your RSVP. Please try again in a moment.",
    };
  }

  return { status: "success" };
}
