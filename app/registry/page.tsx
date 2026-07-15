import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FloralCorner, FloralDivider, FloralDot } from "@/components/Floral";
import { registryItems } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Registry — Danielle & Sahaj",
};

function GiftPhoto({ slug, name }: { slug?: string; name: string }) {
  const exists =
    slug && existsSync(join(process.cwd(), "public", "registry", `${slug}.jpg`));
  if (exists) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/registry/${slug}.jpg`}
        alt={name}
        className="aspect-square w-full rounded-t-2xl object-cover"
      />
    );
  }
  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-t-2xl bg-blue-pale/40">
      <FloralDot className="h-10 w-10 opacity-60" />
    </div>
  );
}

export default function RegistryPage() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />

      <div className="relative mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="font-serif text-5xl tracking-[0.18em] text-blue-deep uppercase sm:text-6xl">
            Registry
          </h1>
          <FloralDivider className="my-8" />
          <p className="mx-auto max-w-xl text-lg leading-relaxed">
            Your presence at our wedding is the greatest gift of all. If you
            wish to celebrate with a gift, we&apos;ve put together a few
            things for our new home.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {registryItems.map((item) => (
            <div
              key={item.name}
              className={`flex flex-col rounded-2xl border border-blue-pale bg-white shadow-sm ${
                item.purchased ? "opacity-60" : ""
              }`}
            >
              <GiftPhoto slug={item.slug} name={item.name} />
              <div className="flex flex-1 flex-col px-5 pb-5 pt-4 text-center">
                <p className="text-sm tracking-[0.2em] text-ink/60 uppercase">
                  {item.brand}
                </p>
                <p className="mt-1 font-serif text-2xl text-blue-deep">
                  {item.name}
                </p>
                <p className="mt-1 text-lg font-medium text-magenta">
                  {item.price}
                </p>
                {(item.needs ?? 1) > 1 && (
                  <p className="mt-1 text-sm text-ink/60">
                    Needs {item.needs}
                  </p>
                )}
                <div className="mt-auto pt-4">
                  {item.purchased ? (
                    <p className="rounded-full border-2 border-olive px-6 py-2 font-serif text-lg tracking-[0.15em] text-olive-deep uppercase">
                      Purchased ✓
                    </p>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-full bg-blue px-6 py-2 font-serif text-lg tracking-[0.15em] text-white uppercase transition-colors hover:bg-blue-deep"
                    >
                      View Gift
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-ink/70">
          More gifts are on their way — check back soon!
        </p>
      </div>
    </section>
  );
}
