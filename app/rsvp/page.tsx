import type { Metadata } from "next";
import RsvpForm from "@/components/RsvpForm";
import { FloralCorner, FloralDivider } from "@/components/Floral";

export const metadata: Metadata = {
  title: "RSVP — Danielle & Sahaj",
};

export default function RsvpPage() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
      <div className="relative mx-auto max-w-xl text-center">
        <h1 className="font-serif text-5xl tracking-[0.18em] text-blue-deep uppercase sm:text-6xl">
          RSVP
        </h1>
        <FloralDivider className="my-8" />
        <p className="mb-10 text-lg leading-relaxed">
          Kindly respond by filling out the form below. We hope you can join
          us for our celebration weekend, May 20&ndash;22, 2027 in Cumming,
          GA.
        </p>
      </div>
      <RsvpForm />
    </section>
  );
}
