import Link from "next/link";
import Countdown from "@/components/Countdown";
import { FloralCorner, FloralDivider } from "@/components/Floral";

const timeline = [
  {
    time: "3:30 PM–4:00 PM",
    name: "Baraat",
    lines: ["Attire: Pakistani or Western Formal attire."],
    detail: "Join us in celebrating the groom as he makes his way to the altar!",
  },
  {
    time: "4:00 PM–6:00 PM",
    name: "Wedding Ceremony",
    lines: [
      "Shiloh Gardens Special Events Venue",
      "5235 Union Hill Road, Cumming, GA, 30040, United States",
      "Attire: Pakistani or Western Formal Attire",
    ],
  },
  {
    time: "6:00 PM–7:00 PM",
    name: "Cocktail Hour",
    lines: ["Attire: Pakistani or Western Formal"],
  },
  {
    time: "7:00 PM–10:30 PM",
    name: "Reception",
    lines: ["Attire: Pakistani or Western Formal"],
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 text-center sm:pb-24 sm:pt-20">
        {/* Faint proposal photo behind the hero text.
            Drop the photo in at public/proposal.jpg — if the file is
            missing the gradient below still carries the section. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/proposal.jpg')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-cream/40 via-transparent to-cream"
          aria-hidden="true"
        />
        <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
        <FloralCorner className="bottom-0 right-0 translate-x-6 translate-y-6 rotate-180" />

        <div className="relative mx-auto max-w-3xl">
          <p className="font-serif text-lg tracking-[0.5em] text-ink uppercase">
            The
            <span className="mx-3 font-script text-6xl normal-case tracking-normal text-magenta sm:text-7xl">
              Wedding
            </span>
            of
          </p>
          <h1 className="mt-8 font-serif text-5xl tracking-[0.12em] text-blue-deep uppercase sm:text-7xl">
            Danielle &amp; Sahaj
          </h1>
          <p className="mt-8 font-serif text-lg tracking-[0.2em] text-ink uppercase sm:text-xl">
            May 20&ndash;22, 2027 &bull; Cumming, GA, United States
          </p>
          <div className="mt-3">
            <Countdown />
          </div>
          <Link
            href="/rsvp"
            className="mt-10 inline-block rounded-full bg-blue px-10 py-3 font-serif text-lg tracking-[0.3em] text-white uppercase shadow-md transition-colors hover:bg-blue-deep"
          >
            RSVP
          </Link>
        </div>
      </section>

      {/* ---------- Date | Place ---------- */}
      <section className="bg-blue-pale/60 px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-3xl grid-cols-1 items-center gap-8 text-center sm:grid-cols-[1fr_auto_1fr]">
          <p className="font-serif text-4xl leading-snug tracking-[0.1em] text-blue-deep uppercase sm:text-5xl">
            May 20&ndash;
            <br />
            22, 2027
          </p>
          <div
            className="mx-auto h-px w-40 bg-magenta sm:h-40 sm:w-px"
            aria-hidden="true"
          />
          <p className="font-serif text-4xl leading-snug tracking-[0.1em] text-blue-deep uppercase sm:text-5xl">
            Cumming
            <br />
            GA
          </p>
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/rsvp"
            className="inline-block rounded-full bg-magenta px-10 py-3 font-serif text-lg tracking-[0.3em] text-white uppercase shadow-md transition-colors hover:bg-pink"
          >
            RSVP
          </Link>
        </div>
      </section>

      {/* ---------- Welcome Party (yellow) ---------- */}
      <section className="bg-gold-pale px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-4xl tracking-[0.18em] text-gold-deep uppercase sm:text-5xl">
            Welcome Party
          </h2>
          <p className="mt-4 font-serif text-xl tracking-[0.15em] uppercase">
            Thursday, May 20, 2027
          </p>
          <p className="mt-2 font-serif text-lg tracking-[0.15em]">
            5:00 PM&ndash;9:00 PM
          </p>
          <p className="mt-6 text-lg italic text-leaf">
            Attire: Smart - Casual (Western or Pakistani)
          </p>
          <p className="mt-6 text-lg leading-relaxed">
            Join us at Sahaj&apos;s childhood home for our welcome party. This
            will be a casual get together with light bites and refreshments.
            Feel free to stop by!
          </p>
        </div>
      </section>

      <FloralDivider />

      {/* ---------- Mehndi (green) ---------- */}
      <section className="mt-8 bg-olive-pale px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-4xl tracking-[0.18em] text-olive-deep uppercase sm:text-5xl">
            Mehndi
          </h2>
          <p className="mt-4 font-serif text-xl tracking-[0.15em] uppercase">
            Friday, May 21, 2027
          </p>
          <p className="mt-2 font-serif text-lg tracking-[0.15em]">
            6:00 PM&ndash;10:00 PM
          </p>
          <p className="mt-6 text-lg italic text-leaf">
            Attire: Western or Pakistani Formal Attire
          </p>
          <p className="mt-6 text-lg leading-relaxed">
            Please join us for the Bridal Henna Ceremony where we will enjoy a
            night of dancing and good food!
          </p>
        </div>
      </section>

      {/* ---------- Wedding Day (pink) ---------- */}
      <section className="bg-pink-pale px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-4xl tracking-[0.18em] text-magenta uppercase sm:text-5xl">
            Wedding Day
          </h2>
          <p className="mt-4 font-serif text-xl tracking-[0.15em] uppercase">
            May 22, 2027
          </p>
          <p className="mt-2 font-serif text-lg tracking-[0.15em]">
            3:30 PM&ndash;10:30 PM
          </p>
          <p className="mt-6 text-lg italic text-leaf">
            Attire: Western or Pakistani Formal
          </p>
          <p className="mt-6 text-lg leading-relaxed">
            Please join us for our wedding day. The Baraat will begin at 3:30
            followed by the wedding ceremony, cocktail hour, and reception.
          </p>
        </div>

        {/* Timeline */}
        <div className="mx-auto mt-14 max-w-3xl">
          <ol className="space-y-0">
            {timeline.map((item, i) => (
              <li
                key={item.name}
                className={`grid grid-cols-1 gap-2 px-4 py-10 text-left sm:grid-cols-[220px_1fr] sm:gap-8 ${
                  i % 2 === 1 ? "bg-white/60" : ""
                } ${i > 0 ? "border-t border-pink/30" : ""}`}
              >
                <p className="font-serif text-xl tracking-[0.12em] text-magenta">
                  {item.time}
                </p>
                <div>
                  <h3 className="font-serif text-2xl tracking-[0.18em] text-blue-deep uppercase">
                    {item.name}
                  </h3>
                  {item.lines.map((line) => (
                    <p key={line} className="mt-2 text-lg leading-relaxed">
                      {line}
                    </p>
                  ))}
                  {item.detail && (
                    <p className="mt-4 text-lg leading-relaxed">{item.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
