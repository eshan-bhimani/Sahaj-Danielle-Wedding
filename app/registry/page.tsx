import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FloralCorner, FloralDivider } from "@/components/Floral";
import RegistryGrid from "@/components/RegistryGrid";
import { registryItems } from "@/lib/registry";
import { getPurchaseCounts } from "./actions";

export const metadata: Metadata = {
  title: "Registry — Danielle & Sahaj",
};

/* Purchase counts must always be fresh — never serve a cached page
 * that shows a bought gift as available. */
export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const initialCounts = await getPurchaseCounts();
  const photos = Object.fromEntries(
    registryItems.map((item) => [
      item.slug,
      existsSync(join(process.cwd(), "public", "registry", `${item.slug}.jpg`)),
    ]),
  );

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />

      <div className="relative mx-auto max-w-6xl">
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
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            Bought something? Tap &ldquo;I purchased this&rdquo; on the gift
            so other guests know it&apos;s taken.
          </p>
        </div>

        <RegistryGrid
          items={registryItems}
          photos={photos}
          initialCounts={initialCounts}
        />
      </div>
    </section>
  );
}
