import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FloralCorner, FloralDivider, FloralDot } from "@/components/Floral";

export const metadata: Metadata = {
  title: "Dress Code — Danielle & Sahaj",
};

/* Drop real photos into public/dress-code/ as photo-1.jpg, photo-2.jpg,
 * photo-3.jpg and the placeholders below are replaced automatically. */
function PhotoSlot({ file, alt }: { file: string; alt: string }) {
  const exists = existsSync(join(process.cwd(), "public", "dress-code", file));
  if (exists) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/dress-code/${file}`}
        alt={alt}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue/30 bg-blue-pale/40 p-6">
      <FloralDot />
      <p className="font-script text-3xl text-blue-deep">Photo coming soon</p>
    </div>
  );
}

const events = [
  {
    name: "Welcome Party",
    card: "bg-gold-pale",
    heading: "text-gold-deep",
    body: (
      <>
        This will be a casual event, we ask that guests wear business casual
        attire in <span className="font-semibold">yellow</span>.
      </>
    ),
  },
  {
    name: "Mehndi",
    card: "bg-olive-pale",
    heading: "text-olive-deep",
    body: (
      <>
        This will be a formal event. We ask our guests to wear either
        Pakistani or Western Formal. We would love if you could wear bright
        colors. The more color you wear the better! Come prepared to dance!
      </>
    ),
  },
  {
    name: "Wedding Day",
    card: "bg-pink-pale",
    heading: "text-magenta",
    body: (
      <>
        We ask that guests wear either Pakistani or Western Formal attire. We
        would love if our guests wear bright colors like blues, greens,
        oranges, and yellows. Our wedding will be outside followed by an
        indoor reception. We ask that guests dress for the weather and
        prepare to wear something that they can dance in later.
      </>
    ),
  },
];

export default function DressCodePage() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
      <FloralCorner className="bottom-0 right-0 translate-x-6 translate-y-6 rotate-180" />

      <div className="relative mx-auto max-w-3xl">
        <div className="text-center">
          <h1 className="font-serif text-5xl tracking-[0.18em] text-blue-deep uppercase sm:text-6xl">
            Dress Code
          </h1>
          <FloralDivider className="my-8" />
          <h2 className="font-serif text-3xl tracking-[0.2em] text-ink uppercase">
            Wedding Weekend
          </h2>
        </div>

        {/* Per-event guidance, in each event's color */}
        <div className="mt-10 space-y-6">
          {events.map(({ name, card, heading, body }) => (
            <div key={name} className={`rounded-2xl px-6 py-7 sm:px-8 ${card}`}>
              <h3
                className={`font-serif text-2xl tracking-[0.18em] uppercase ${heading}`}
              >
                {name}
              </h3>
              <p className="mt-3 text-lg leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Inspiration photos */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="aspect-[4/5]">
            <PhotoSlot file="photo-1.jpg" alt="Garden party attire inspiration" />
          </div>
          <div className="aspect-[4/5]">
            <PhotoSlot file="photo-2.jpg" alt="Bright formal attire inspiration" />
          </div>
        </div>
        <div className="mx-auto mt-5 max-w-md">
          <div className="aspect-[4/5]">
            <PhotoSlot
              file="photo-3.jpg"
              alt="Guests in Pakistani formal attire"
            />
          </div>
        </div>

        {/* Pakistani formal explainer */}
        <div className="mt-16 text-center">
          <FloralDivider className="mb-10" />
          <h2 className="font-serif text-3xl tracking-[0.15em] text-blue-deep uppercase sm:text-4xl">
            What is Pakistani Formal Attire?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed">
            Sarees, Lehengas, and Sharara Suits are all great options for
            women. For men, we would love to see you wear a Kurta set. You can
            find outfits on Lashkara, Kalki Fashion, and even Amazon.
          </p>
        </div>
      </div>
    </section>
  );
}
