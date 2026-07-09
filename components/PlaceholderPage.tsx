import Link from "next/link";
import { FloralCorner, FloralDivider } from "./Floral";

export default function PlaceholderPage({
  title,
  message,
  accent = "text-magenta",
}: {
  title: string;
  message: string;
  accent?: string;
}) {
  return (
    <section className="relative overflow-hidden px-4 py-24 text-center sm:py-32">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
      <FloralCorner className="bottom-0 right-0 translate-x-6 translate-y-6 rotate-180" />
      <div className="relative mx-auto max-w-xl">
        <h1
          className={`font-serif text-5xl tracking-[0.18em] uppercase sm:text-6xl ${accent}`}
        >
          {title}
        </h1>
        <FloralDivider className="my-10" />
        <p className="font-script text-4xl text-blue-deep">
          Details coming soon
        </p>
        <p className="mt-6 text-lg leading-relaxed">{message}</p>
        <Link
          href="/"
          className="mt-10 inline-block rounded-full border-2 border-blue px-8 py-2.5 font-serif text-lg tracking-[0.25em] text-blue-deep uppercase transition-colors hover:bg-blue hover:text-white"
        >
          Back Home
        </Link>
      </div>
    </section>
  );
}
