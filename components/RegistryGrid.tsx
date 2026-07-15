"use client";

import { useMemo, useState, useTransition } from "react";
import {
  markGiftPurchased,
  type PurchaseCounts,
} from "@/app/registry/actions";
import type { RegistryItem } from "@/lib/registry";
import { FloralDot } from "./Floral";

const PRICE_BUCKETS = [
  { label: "$0–49", min: 0, max: 49.99 },
  { label: "$50–99", min: 50, max: 99.99 },
  { label: "$100–149", min: 100, max: 149.99 },
  { label: "$150+", min: 150, max: Infinity },
];

const STATUS = ["Available", "Purchased"] as const;

function checkboxRow(active: boolean) {
  return `flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-lg transition-colors ${
    active ? "text-magenta" : "text-ink hover:text-blue-deep"
  }`;
}

export default function RegistryGrid({
  items,
  photos,
  initialCounts,
}: {
  items: RegistryItem[];
  photos: Record<string, boolean>;
  initialCounts: PurchaseCounts;
}) {
  const [counts, setCounts] = useState<PurchaseCounts>(initialCounts);
  const [priceFilters, setPriceFilters] = useState<number[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isPurchased = (item: RegistryItem) =>
    (counts[item.slug] ?? 0) >= (item.needs ?? 1);

  const visible = useMemo(
    () =>
      items.filter((item) => {
        if (
          priceFilters.length > 0 &&
          !priceFilters.some((i) => {
            const b = PRICE_BUCKETS[i];
            return item.price >= b.min && item.price <= b.max;
          })
        ) {
          return false;
        }
        if (statusFilters.length > 0) {
          const status = isPurchased(item) ? "Purchased" : "Available";
          if (!statusFilters.includes(status)) return false;
        }
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, priceFilters, statusFilters, counts],
  );

  function toggle<T>(list: T[], value: T, set: (next: T[]) => void) {
    set(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    );
  }

  function confirmPurchase(slug: string) {
    startTransition(async () => {
      const result = await markGiftPurchased(slug);
      setCounts(result.counts);
      setConfirming(null);
    });
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[210px_1fr]">
      {/* ---------- Filters ---------- */}
      <aside>
        <div className="rounded-2xl border border-blue-pale bg-white px-4 py-5 lg:sticky lg:top-24">
          <p className="font-serif text-xl tracking-[0.15em] text-blue-deep uppercase">
            Price
          </p>
          <div className="mt-2">
            {PRICE_BUCKETS.map((bucket, i) => (
              <label key={bucket.label} className={checkboxRow(priceFilters.includes(i))}>
                <input
                  type="checkbox"
                  checked={priceFilters.includes(i)}
                  onChange={() => toggle(priceFilters, i, setPriceFilters)}
                  className="h-4 w-4 accent-magenta"
                />
                {bucket.label}
              </label>
            ))}
          </div>
          <p className="mt-5 font-serif text-xl tracking-[0.15em] text-blue-deep uppercase">
            Status
          </p>
          <div className="mt-2">
            {STATUS.map((status) => (
              <label key={status} className={checkboxRow(statusFilters.includes(status))}>
                <input
                  type="checkbox"
                  checked={statusFilters.includes(status)}
                  onChange={() => toggle(statusFilters, status, setStatusFilters)}
                  className="h-4 w-4 accent-magenta"
                />
                {status}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ---------- Gifts ---------- */}
      <div>
        <p className="mb-4 text-ink/70">
          {visible.length} gift{visible.length === 1 ? "" : "s"}
          {priceFilters.length || statusFilters.length ? " matching" : " available"}
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => {
            const purchased = isPurchased(item);
            const count = counts[item.slug] ?? 0;
            const needs = item.needs ?? 1;
            return (
              <div
                key={item.slug}
                className={`flex flex-col rounded-2xl border border-blue-pale bg-white shadow-sm ${
                  purchased ? "opacity-60" : ""
                }`}
              >
                {photos[item.slug] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/registry/${item.slug}.jpg`}
                    alt={item.name}
                    className="aspect-square w-full rounded-t-2xl object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-t-2xl bg-blue-pale/40">
                    <FloralDot className="h-10 w-10 opacity-60" />
                  </div>
                )}
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4 text-center">
                  <p className="text-sm tracking-[0.2em] text-ink/60 uppercase">
                    {item.brand}
                  </p>
                  <p className="mt-1 font-serif text-2xl leading-snug text-blue-deep">
                    {item.name}
                  </p>
                  <p className="mt-1 text-lg font-medium text-magenta">
                    {item.priceDisplay}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    {purchased
                      ? "Purchased — thank you!"
                      : needs > 1
                        ? `Needs ${needs}${count > 0 ? ` (${count} purchased)` : ""}`
                        : "Needs 1"}
                  </p>

                  <div className="mt-auto space-y-2 pt-4">
                    {purchased ? (
                      <p className="rounded-full border-2 border-olive px-6 py-2 font-serif text-lg tracking-[0.15em] text-olive-deep uppercase">
                        Purchased ✓
                      </p>
                    ) : confirming === item.slug ? (
                      <div className="space-y-2">
                        <p className="text-sm text-ink/70">
                          Mark as purchased? Other guests will see it&apos;s
                          taken.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => confirmPurchase(item.slug)}
                            className="flex-1 rounded-full bg-olive px-4 py-2 font-serif tracking-[0.1em] text-white uppercase transition-colors hover:bg-olive-deep disabled:opacity-60"
                          >
                            {pending ? "…" : "Yes"}
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => setConfirming(null)}
                            className="flex-1 rounded-full border-2 border-ink/30 px-4 py-2 font-serif tracking-[0.1em] text-ink/70 uppercase hover:border-ink/60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-full bg-blue px-6 py-2 font-serif text-lg tracking-[0.15em] text-white uppercase transition-colors hover:bg-blue-deep"
                        >
                          View Gift
                        </a>
                        <button
                          type="button"
                          onClick={() => setConfirming(item.slug)}
                          className="block w-full rounded-full border-2 border-olive px-6 py-1.5 font-serif tracking-[0.1em] text-olive-deep uppercase transition-colors hover:bg-olive hover:text-white"
                        >
                          I purchased this
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {visible.length === 0 && (
          <p className="mt-10 text-center text-lg text-ink/60">
            No gifts match those filters.
          </p>
        )}
      </div>
    </div>
  );
}
