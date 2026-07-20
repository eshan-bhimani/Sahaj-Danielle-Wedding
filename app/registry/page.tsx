import type { Metadata } from "next";
import { FloralCorner, FloralDivider } from "@/components/Floral";

export const metadata: Metadata = {
  title: "Registry — Danielle & Sahaj",
};

export default function RegistryPage() {
  return (
    <section className="relative overflow-hidden px-4 py-24 text-center sm:py-32">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
      <FloralCorner className="bottom-0 right-0 translate-x-6 translate-y-6 rotate-180" />
      <div className="relative mx-auto max-w-xl">
        <h1 className="font-serif text-5xl tracking-[0.18em] text-blue-deep uppercase sm:text-6xl">
          Registry
        </h1>
        <FloralDivider className="my-10" />
        <p className="font-script text-4xl text-magenta sm:text-5xl">
          Link to Registry Coming Soon
        </p>
        <p className="mt-8 text-lg leading-relaxed">
          Your presence at our wedding is the greatest gift of all.
        </p>
      </div>
    </section>
  );
}
