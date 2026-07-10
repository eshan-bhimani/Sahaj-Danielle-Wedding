import type { Metadata } from "next";
import RsvpFlow from "@/components/RsvpFlow";
import { FloralCorner, FloralDivider } from "@/components/Floral";
import { loadHousehold } from "./actions";

export const metadata: Metadata = {
  title: "RSVP — Danielle & Sahaj",
};

export default async function RsvpPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const initialHousehold = code ? await loadHousehold({ code }) : null;

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
      <div className="relative mx-auto max-w-xl text-center">
        <h1 className="font-serif text-5xl tracking-[0.18em] text-blue-deep uppercase sm:text-6xl">
          RSVP
        </h1>
        <FloralDivider className="my-8" />
        <p className="mb-10 text-lg leading-relaxed">
          We hope you can join us for our celebration weekend, May
          20&ndash;22, 2027 in Cumming, GA. Find your invitation below to
          respond for your party.
        </p>
      </div>
      <RsvpFlow
        initialHousehold={initialHousehold}
        codeNotFound={Boolean(code) && !initialHousehold}
      />
    </section>
  );
}
