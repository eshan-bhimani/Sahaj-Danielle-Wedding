"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  loadHousehold,
  searchHouseholds,
  submitHouseholdRsvp,
  type Household,
  type HouseholdMatch,
} from "@/app/rsvp/actions";
import AddToCalendar from "./AddToCalendar";
import { FloralDivider } from "./Floral";

type EventKey = "welcomeParty" | "mehndi" | "weddingDay";

/* Each event carries the bride's color: yellow Welcome Party, green
 * Mehndi, pink Wedding Day. */
const EVENTS: { key: EventKey; label: string; date: string; accent: string }[] = [
  {
    key: "welcomeParty",
    label: "Welcome Party",
    date: "Thursday, May 20",
    accent: "text-gold-deep",
  },
  {
    key: "mehndi",
    label: "Mehndi",
    date: "Friday, May 21",
    accent: "text-olive-deep",
  },
  {
    key: "weddingDay",
    label: "Wedding Day",
    date: "Saturday, May 22",
    accent: "text-magenta",
  },
];

type Answers = Record<string, Partial<Record<EventKey, boolean | null>>>;

const inputClasses =
  "w-full rounded-lg border border-blue/40 bg-white px-4 py-3 text-lg text-ink placeholder:text-ink/40 focus:border-blue-deep focus:outline-none focus:ring-2 focus:ring-blue-pale";

const headingClasses =
  "mb-2 block font-serif text-xl tracking-[0.15em] text-blue-deep uppercase";

const homeButtonClasses =
  "block w-full rounded-full bg-blue px-8 py-3 text-center font-serif text-lg tracking-[0.25em] text-white uppercase transition-colors hover:bg-blue-deep";

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

/* Prefill from saved responses so "Update Response" starts from the
 * household's current answers. */
function savedAnswers(household: Household): Answers {
  const answers: Answers = {};
  for (const guest of household.guests) {
    answers[guest.id] = {};
    for (const { key } of invitedEvents(household)) {
      answers[guest.id][key] = guest[key];
    }
  }
  return answers;
}

/* ---------- Recap of a saved RSVP, grouped by event ---------- */

function RsvpRecap({ household }: { household: Household }) {
  return (
    <div className="mt-8 space-y-8 text-left">
      {invitedEvents(household).map(({ key, label, date, accent }) => (
        <div key={key} className="border-t border-blue-pale pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={`font-serif text-2xl ${accent}`}>
              {label}
              <span className="ml-2 text-sm font-normal text-ink/60">
                {date}
              </span>
            </p>
            <AddToCalendar eventKey={key} />
          </div>
          <ul className="mt-3 space-y-2">
            {household.guests.map((guest) => (
              <li key={guest.id} className="flex items-center gap-3 text-lg">
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-sm text-white ${
                    guest[key] ? "bg-olive" : "bg-ink/30"
                  }`}
                >
                  {guest[key] ? "✓" : "✕"}
                </span>
                <span>
                  {guest.name}
                  <span className="ml-2 text-sm text-ink/50">
                    {guest[key] ? "attending" : "not attending"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {household.foodAllergies && (
        <p className="border-t border-blue-pale pt-5 text-lg">
          <span className="font-medium">Food allergies:</span>{" "}
          {household.foodAllergies}
        </p>
      )}
    </div>
  );
}

function BackToSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex items-center gap-2 font-serif text-lg tracking-[0.1em] text-blue-deep transition-colors hover:text-magenta"
    >
      <span aria-hidden="true">&larr;</span> Back to search
    </button>
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
  const [email, setEmail] = useState("");
  const [updating, setUpdating] = useState(false);
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
    setAllergies("");
    setNotes("");
    setEmail("");
    setUpdating(false);
    setSubmitted(false);
    setError(null);
  }

  /* Keeps the previous search results so guests land back on the list. */
  function backToSearch() {
    setHousehold(null);
    setUpdating(false);
    setSubmitted(false);
    setError(null);
  }

  function startUpdate() {
    if (!household) return;
    setAnswers(savedAnswers(household));
    setAllergies(household.foodAllergies ?? "");
    setNotes(household.notes ?? "");
    setEmail(household.email ?? "");
    setUpdating(true);
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
        email,
      });
      if (result.ok) {
        const fresh = await loadHousehold({ id: household.householdId });
        if (fresh) setHousehold(fresh);
        setUpdating(false);
        setSubmitted(true);
      } else if (result.error === "email") {
        setError(
          "That email address doesn't look right — fix it or leave it blank.",
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
        {email.trim() && (
          <p className="mt-3 text-ink/70">
            A confirmation email is on its way to{" "}
            <span className="font-medium">{email.trim()}</span>.
          </p>
        )}
        <RsvpRecap household={household} />
        <p className="mt-8 text-ink/70">
          Plans change? You can come back and update your response anytime.
        </p>
        <div className="mt-6">
          <Link href="/" className={homeButtonClasses}>
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Welcome back: recap + update ---------- */
  if (household && household.responded && !updating) {
    return (
      <div className="mx-auto max-w-xl">
        <BackToSearchButton onClick={backToSearch} />
        <div className="rounded-2xl bg-gold-pale/60 px-6 py-12 text-center">
          <p className="font-serif text-3xl leading-snug text-blue-deep">
            Welcome back! Here&apos;s a quick recap of your RSVP.
          </p>
          <FloralDivider className="my-8" />
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-medium">Your RSVP response</p>
            <button
              type="button"
              onClick={startUpdate}
              className="font-serif text-lg tracking-[0.1em] text-magenta underline underline-offset-4 transition-colors hover:text-pink"
            >
              Update Response
            </button>
          </div>
          <RsvpRecap household={household} />
          <div className="mt-10">
            <Link href="/" className={homeButtonClasses}>
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- RSVP form (first response or update) ---------- */
  if (household) {
    const events = invitedEvents(household);
    return (
      <div className="mx-auto max-w-2xl">
        <BackToSearchButton onClick={backToSearch} />
        <div className="rounded-2xl bg-blue-pale/60 px-6 py-8 text-center">
          <p className="font-script text-4xl text-magenta">
            {updating ? "Updating your RSVP," : "Welcome,"}
          </p>
          <p className="mt-2 font-serif text-3xl tracking-[0.1em] text-blue-deep uppercase">
            {household.name}
          </p>
          <p className="mt-4 text-lg">
            {updating
              ? "Your saved answers are filled in below — change whatever you need and resend."
              : `You're invited to ${events
                  .map((e) => e.label)
                  .join(events.length > 2 ? ", " : " and ")}. Please respond for each person in your party.`}
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
                {events.map(({ key, label, date, accent }) => {
                  const value = answers[guest.id]?.[key];
                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className={`text-lg font-medium ${accent}`}>
                        {label}
                        <span className="ml-2 text-sm font-normal text-ink/60">
                          {date}
                        </span>
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

        {/* Email, allergies + notes */}
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="confirmation_email" className={headingClasses}>
              Email
            </label>
            <input
              id="confirmation_email"
              type="email"
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
            <p className="mt-1.5 text-sm text-ink/60">
              Optional — we&apos;ll send your confirmation here.
            </p>
          </div>
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
              placeholder="Note for the couple"
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
          One response per household covers your whole party — and you can
          come back to update it anytime.
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="mt-4 w-full rounded-full bg-blue px-10 py-4 font-serif text-xl tracking-[0.3em] text-white uppercase shadow-md transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : updating ? "Update RSVP" : "Send RSVP"}
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
            placeholder="Full Name"
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
