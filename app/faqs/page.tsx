import type { Metadata } from "next";
import { FloralCorner, FloralDivider, FloralDot } from "@/components/Floral";

export const metadata: Metadata = {
  title: "FAQs — Danielle & Sahaj",
};

const faqs = [
  {
    question: "Is there lodging?",
    answer:
      "While we are not reserving blocks of rooms for guests, there are an abundance of hotels close to the venue for guests to stay at. We recommend looking at Avalon in Alpharetta, GA for a mix of shopping and restaurants that is still close to the venue.",
  },
  {
    question: "Can I bring people who were not invited?",
    answer:
      "While we wish that we could have everyone, our venue can only support a small number of people. We ask that you only RSVP for anyone who is able to come and not bring anyone else. We have had to be very selective about who we are able to invite and are very excited to have you there!",
  },
  {
    question: "When is the RSVP deadline?",
    answer:
      "We ask that you RSVP as soon as possible in order for us to get accurate headcounts. However, the official deadline to RSVP is April 1st.",
  },
];

export default function FaqsPage() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
      <FloralCorner className="bottom-0 right-0 translate-x-6 translate-y-6 rotate-180" />

      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-5xl tracking-[0.18em] text-blue-deep uppercase sm:text-6xl">
          Q + A
        </h1>
        <FloralDivider className="my-8" />

        <div className="space-y-14">
          {faqs.map(({ question, answer }, i) => (
            <div key={question}>
              {i > 0 && (
                <div className="mb-14 flex justify-center">
                  <FloralDot />
                </div>
              )}
              <h2 className="font-serif text-2xl tracking-[0.15em] text-magenta uppercase sm:text-3xl">
                {question}
              </h2>
              <p className="mt-5 text-left text-lg leading-relaxed sm:text-center">
                {answer}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-ink/70">
          Have a question we didn&apos;t answer? Reach out to Danielle &amp;
          Sahaj directly — we&apos;re happy to help!
        </p>
      </div>
    </section>
  );
}
