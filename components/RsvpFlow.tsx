"use client";

import { useState, useTransition } from "react";
import {
  loadHousehold,
  searchHouseholds,
  submitHouseholdRsvp,
  type Household,
  type HouseholdMatch,
} from "@/app/rsvp/actions";
import { FloralDivider } from "./Floral";

type EventKey = "welcomeParty" | "mehndi" | "weddingDay";

const EVENTS: { key: EventKey; label: string; date: string }[] = [
  { key: "welcomeParty", label: "Welcome Party", date: "Thursday, May 20" },
  { key: "mehndi", label: "Mehndi", date: "Friday, May 21" },
  { key: "weddingDay", label: "Wedding Day", date: "Saturday, May 22" },
];

type Answers = Record<string, Partial<Record<EventKey, boolean | null>>>;

const inputClasses =
  "w-full rounded-lg border border-blue/40 bg-white px-4 py-3 text-lg text-ink placeholder:text-ink/40 focus:border-blue-deep focus:outline-none focus:ring-2 focus:ring-blue-pale";

const headingClasses =
  "mb-2 block font-serif text-xl tracking-[0.15em] text-blue-deep uppercase";

function invitedEvents(household: Household) {
  return EVENTS.filter(({ key }) => household.invited[key]);
}

function emptyAnswers(household: Household): Answers {
  const answers: Answers = {};
  for (const guest of household.guests) {
    answers[guest.id] = {};
    for (const { key } of invitedEvents(household)) {
      answers[guest.id][key] = null;
    }
  }
  return answers;
}

/* ---------- Read-only summary (already responded / just submitted) ---------- */

function ResponseSummary({ household }: { household: Household }) {
  const events = invitedEvents(household);
  return (
    <div className="mt-8 space-y-4 text-left">
      {household.guests.map((guest) => (
        <div
          key={guest.id}
          className="rounded-xl border border-blue/30 bg-white px-5 py-4"
        >
          <p className="font-serif text-xl text-blue-deep">{guest.name}</p>
          <ul className="mt-2 space-y-1">
            {events.map(({ key, label }) => (
              <li key={key} className="flex justify-between text-lg">
                <span>{label}</span>
                <span
                  className={
                    guest[key] ? "text-olive font-medium" : "text-ink/60"
                  }
                >
                  {guest[key] ? "Attending" : "Not attending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {household.foodAllergies && (
        <p className="text-lg">
          <span className="font-medium">Food allergies:</span>{" "}
          {household.foodAllergies}
        </p>
      )}
    </div>
  );
}

/* ---------- Main flow ---------- */

export default function RsvpFlow({
  initialHousehold,
  codeNotFound = false,
}: {
  initialHousehold: Household | null;
  codeNotFound?: boolean;
}) {
  const [household, setHousehold] = useState<Household | null>(
    initialHousehold,
  );
  const [answers, setAnswers] = useState<Answers>(
    initialHousehold ? emptyAnswers(initialHousehold) : {},
  );
  const [matches, setMatches] = useState<HouseholdMatch[] | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(
    codeNotFound
      ? "We couldn't find an invitation for that code. Try searching by name below."
      : null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function openHousehold(h: Household) {
    setHousehold(h);
    setAnswers(emptyAnswers(h));
    setMatches(null);
    setError(null);
  }

  function handleSearch() {
    if (name.trim().length < 3) {
      setError("Please enter at least 3 letters of a name.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const results = await searchHouseholds(name);
      if (results.length === 0) {
        setMatches(null);
        setError(
          "We couldn't find your invitation. Try another spelling, or reach out to Danielle & Sahaj.",
        );
      } else {
        setMatches(results);
      }
    });
  }

  function handleCode() {
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const h = await loadHousehold({ code });
      if (h) openHousehold(h);
      else
        setError(
          "That invite code didn't match an invitation. Double-check it, or search by name instead.",
        );
    });
  }

  function pickMatch(match: HouseholdMatch) {
    setError(null);
    startTransition(async () => {
      const h = await loadHousehold({ id: match.householdId });
      if (h) openHousehold(h);
      else setError("Something went wrong loading that invitation.");
    });
  }

  function setAnswer(guestId: string, event: EventKey, value: boolean) {
    setAnswers((prev) => ({
      ...prev,
      [guestId]: { ...prev[guestId], [event]: value },
    }));
  }

  function setEveryone(value: boolean) {
    if (!household) return;
    const filled: Answers = {};
    for (const guest of household.guests) {
      filled[guest.id] = {};
      for (const { key } of invitedEvents(household)) {
        filled[guest.id][key] = value;
      }
    }
    setAnswers(filled);
  }

  function handleSubmit() {
    if (!household) return;
    const events = invitedEvents(household);
    const incomplete = household.guests.some((guest) =>
      events.some(({ key }) => answers[guest.id]?.[key] == null),
    );
    if (incomplete) {
      setError(
        "Please answer yes or no for every person and every event before sending.",
      );
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitHouseholdRsvp({
        householdId: household.householdId,
        responses: household.guests.map((guest) => ({
          guestId: guest.id,
          welcomeParty: answers[guest.id]?.welcomeParty ?? null,
          mehndi: answers[guest.id]?.mehndi ?? null,
          weddingDay: answers[guest.id]?.weddingDay ?? null,
        })),
        foodAllergies: allergies,
        notes,
      });
      if (result.ok) {
        const fresh = await loadHousehold({ id: household.householdId });
        if (fresh) setHousehold(fresh);
        setSubmitted(true);
      } else if (result.error === "already_responded") {
        setError(
          "This invitation has already been responded to. Reach out to Danielle & Sahaj if anything needs to change.",
        );
      } else {
        setError(
          "Something went wrong saving your RSVP. Please try again in a moment.",
        );
      }
    });
  }

  /* ---------- Thank-you screen ---------- */
  if (household && submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-blue-pale/60 px-6 py-12 text-center">
        <p className="font-script text-5xl text-magenta">Thank you!</p>
        <FloralDivider className="my-8" />
        <p className="text-lg leading-relaxed">
          Your RSVP for <span className="font-medium">{household.name}</span>{" "}
          has been received. We can&apos;t wait to celebrate with you!
        </p>
        <ResponseSummary household={household} />
        <p className="mt-8 text-ink/70">
          Responses can&apos;t be changed online after submitting — if plans
          change, please reach out to Danielle &amp; Sahaj directly.
        </p>
      </div>
    );
  }

  /* ---------- Already responded ---------- */
  if (household && household.responded) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-gold-pale/60 px-6 py-12 text-center">
        <p className="font-script text-4xl text-poppy">
          You&apos;ve already RSVP&apos;d
        </p>
        <FloralDivider className="my-8" />
        <p className="text-lg leading-relaxed">
          We have a response on file for{" "}
          <span className="font-medium">{household.name}</span>.
        </p>
        <ResponseSummary household={household} />
        <p className="mt-8 text-ink/70">
          If plans change, please reach out to Danielle &amp; Sahaj directly.
        </p>
      </div>
    );
  }

  /* ---------- RSVP form ---------- */
  if (household) {
    const events = invitedEvents(household);
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-blue-pale/60 px-6 py-8 text-center">
          <p className="font-script text-4xl text-magenta">Welcome,</p>
          <p className="mt-2 font-serif text-3xl tracking-[0.1em] text-blue-deep uppercase">
            {household.name}
          </p>
          <p className="mt-4 text-lg">
            You&apos;re invited to{" "}
            {events.map((e) => e.label).join(events.length > 2 ? ", " : " and ")}
            . Please respond for each person in your party.
          </p>
        </div>

        {/* Everyone shortcuts */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setEveryone(true)}
            className="rounded-full border-2 border-olive px-6 py-2.5 font-serif text-lg tracking-[0.1em] text-leaf transition-colors hover:bg-olive hover:text-white"
          >
            Everyone joyfully accepts
          </button>
          <button
            type="button"
            onClick={() => setEveryone(false)}
            className="rounded-full border-2 border-ink/30 px-6 py-2.5 font-serif text-lg tracking-[0.1em] text-ink/70 transition-colors hover:bg-ink/70 hover:text-white"
          >
            Everyone regretfully declines
          </button>
        </div>
        <p className="mt-3 text-center text-sm text-ink/60">
          …or answer person by person below. You can mix and match.
        </p>

        {/* Per-guest grid */}
        <div className="mt-6 space-y-5">
          {household.guests.map((guest) => (
            <div
              key={guest.id}
              className="rounded-xl border border-blue/30 bg-white px-5 py-4"
            >
              <p className="font-serif text-2xl text-blue-deep">{guest.name}</p>
              <div className="mt-3 space-y-3">
                {events.map(({ key, label, date }) => {
                  const value = answers[guest.id]?.[key];
                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-lg">
                        {label}
                        <span className="ml-2 text-sm text-ink/60">{date}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAnswer(guest.id, key, true)}
                          className={`rounded-full border-2 px-5 py-1.5 text-lg transition-colors ${
                            value === true
                              ? "border-olive bg-olive text-white"
                              : "border-blue/40 bg-white hover:border-olive"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnswer(guest.id, key, false)}
                          className={`rounded-full border-2 px-5 py-1.5 text-lg transition-colors ${
                            value === false
                              ? "border-magenta bg-magenta text-white"
                              : "border-blue/40 bg-white hover:border-magenta"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Allergies + notes */}
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="food_allergies" className={headingClasses}>
              Food Allergies
            </label>
            <input
              id="food_allergies"
              type="text"
              maxLength={1000}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Let us know about any food allergies in your party"
              className={inputClasses}
            />
            <p className="mt-1.5 text-sm text-ink/60">Leave blank if none.</p>
          </div>
          <div>
            <label htmlFor="notes" className={headingClasses}>
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Song requests or a note for the couple"
              className={inputClasses}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-poppy bg-gold-pale px-4 py-3 text-poppy"
          >
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-ink/60">
          One response per household — answers can&apos;t be changed online
          once sent, so double-check before submitting!
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="mt-4 w-full rounded-full bg-blue px-10 py-4 font-serif text-xl tracking-[0.3em] text-white uppercase shadow-md transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send RSVP"}
        </button>
      </div>
    );
  }

  /* ---------- Lookup ---------- */
  return (
    <div className="mx-auto max-w-xl">
      <div>
        <label htmlFor="name_search" className={headingClasses}>
          Find your invitation
        </label>
        <p className="mb-3 text-ink/70">
          Enter the name of anyone in your party.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="name_search"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. Priya Kapoor"
            className={inputClasses}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={pending}
            className="rounded-full bg-blue px-8 py-3 font-serif text-lg tracking-[0.2em] text-white uppercase transition-colors hover:bg-blue-deep disabled:opacity-60"
          >
            {pending ? "…" : "Search"}
          </button>
        </div>
      </div>

      {matches && (
        <div className="mt-6 space-y-3">
          <p className="text-ink/70">Select your party:</p>
          {matches.map((match) => (
            <button
              key={match.householdId}
              type="button"
              onClick={() => pickMatch(match)}
              disabled={pending}
              className="block w-full rounded-xl border-2 border-blue/40 bg-white px-5 py-4 text-left transition-colors hover:border-magenta disabled:opacity-60"
            >
              <span className="font-serif text-xl text-blue-deep">
                {match.householdName}
              </span>
              <span className="mt-1 block text-sm text-ink/60">
                {match.matchedGuests.join(", ")}
              </span>
            </button>
          ))}
        </div>
      )}

      <FloralDivider className="my-10" />

      <div>
        <label htmlFor="invite_code" className={headingClasses}>
          Have an invite code?
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="invite_code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleCode()}
            placeholder="e.g. K7M2PQ"
            className={`${inputClasses} uppercase tracking-[0.2em]`}
          />
          <button
            type="button"
            onClick={handleCode}
            disabled={pending}
            className="rounded-full border-2 border-blue px-8 py-3 font-serif text-lg tracking-[0.2em] text-blue-deep uppercase transition-colors hover:bg-blue hover:text-white disabled:opacity-60"
          >
            {pending ? "…" : "Open"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-poppy bg-gold-pale px-4 py-3 text-poppy"
        >
          {error}
        </p>
      )}
    </div>
  );
}
