"use client";

import { useActionState, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/rsvp/actions";
import { FloralDivider } from "./Floral";

const initialState: RsvpState = { status: "idle" };

const inputClasses =
  "w-full rounded-lg border border-blue/40 bg-white px-4 py-3 text-lg text-ink placeholder:text-ink/40 focus:border-blue-deep focus:outline-none focus:ring-2 focus:ring-blue-pale";

const events = [
  { name: "event_welcome", label: "Welcome Party", detail: "Thursday, May 20" },
  { name: "event_mehndi", label: "Mehndi", detail: "Friday, May 21" },
  { name: "event_wedding", label: "Wedding Day", detail: "Saturday, May 22" },
];

export default function RsvpForm() {
  const [state, formAction, pending] = useActionState(submitRsvp, initialState);
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);

  if (state.status === "success") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-blue-pale/60 px-6 py-14 text-center">
        <p className="font-script text-5xl text-magenta">Thank you!</p>
        <FloralDivider className="my-8" />
        <p className="text-lg leading-relaxed">
          Your RSVP has been received. We can&apos;t wait to celebrate with
          you!
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-8">
      {/* Name */}
      <div>
        <label
          htmlFor="guest_name"
          className="mb-2 block font-serif text-xl tracking-[0.15em] text-blue-deep uppercase"
        >
          Your Name
        </label>
        <input
          id="guest_name"
          name="guest_name"
          type="text"
          required
          maxLength={200}
          placeholder="First and last name"
          className={inputClasses}
        />
      </div>

      {/* Attending */}
      <fieldset>
        <legend className="mb-3 font-serif text-xl tracking-[0.15em] text-blue-deep uppercase">
          Will you be joining us?
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              { value: "yes", label: "Joyfully accepts" },
              { value: "no", label: "Regretfully declines" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-center text-lg transition-colors ${
                attending === value
                  ? "border-magenta bg-pink-pale text-magenta"
                  : "border-blue/40 bg-white hover:border-blue"
              }`}
            >
              <input
                type="radio"
                name="attending"
                value={value}
                required
                className="sr-only"
                onChange={() => setAttending(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {attending === "yes" && (
        <>
          {/* Number of guests */}
          <div>
            <label
              htmlFor="num_guests"
              className="mb-2 block font-serif text-xl tracking-[0.15em] text-blue-deep uppercase"
            >
              Number of Guests
            </label>
            <select
              id="num_guests"
              name="num_guests"
              defaultValue="1"
              className={inputClasses}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-sm text-ink/60">
              Including yourself.
            </p>
          </div>

          {/* Events */}
          <fieldset>
            <legend className="mb-3 font-serif text-xl tracking-[0.15em] text-blue-deep uppercase">
              Which events will you attend?
            </legend>
            <div className="space-y-3">
              {events.map(({ name, label, detail }) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-blue/40 bg-white px-4 py-3 transition-colors hover:border-blue has-checked:border-olive has-checked:bg-gold-pale/60"
                >
                  <input
                    type="checkbox"
                    name={name}
                    className="h-5 w-5 accent-olive"
                  />
                  <span className="text-lg">
                    {label}
                    <span className="ml-2 text-sm text-ink/60">{detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Meal preference */}
          <fieldset>
            <legend className="mb-3 font-serif text-xl tracking-[0.15em] text-blue-deep uppercase">
              Meal Preference
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["Chicken", "Lamb", "Vegetarian"].map((meal) => (
                <label
                  key={meal}
                  className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-blue/40 bg-white px-4 py-3 text-lg transition-colors hover:border-blue has-checked:border-poppy has-checked:bg-gold-pale/60 has-checked:text-poppy"
                >
                  <input
                    type="radio"
                    name="meal_preference"
                    value={meal}
                    required
                    className="sr-only"
                  />
                  {meal}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="mb-2 block font-serif text-xl tracking-[0.15em] text-blue-deep uppercase"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          placeholder="Dietary restrictions, song requests, or a note for the couple"
          className={inputClasses}
        />
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-poppy bg-gold-pale px-4 py-3 text-poppy"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-blue px-10 py-4 font-serif text-xl tracking-[0.3em] text-white uppercase shadow-md transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send RSVP"}
      </button>
    </form>
  );
}
