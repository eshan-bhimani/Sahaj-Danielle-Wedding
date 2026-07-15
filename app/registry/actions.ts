"use server";

import { getSupabase } from "@/lib/supabase";
import { registryItems } from "@/lib/registry";

export type PurchaseCounts = Record<string, number>;

export async function getPurchaseCounts(): Promise<PurchaseCounts> {
  const { data, error } = await getSupabase().rpc("get_registry_purchases");
  if (error || !data) {
    if (error) console.error("Registry counts fetch failed:", error.message);
    return {};
  }
  return Object.fromEntries(
    (data as { slug: string; purchased: number }[]).map((r) => [
      r.slug,
      r.purchased,
    ]),
  );
}

/* Marks one unit of a gift purchased. Returns fresh counts so the page
 * can update immediately. Increment-only by design — corrections go
 * through the couple. */
export async function markGiftPurchased(
  slug: string,
): Promise<{ ok: boolean; counts: PurchaseCounts }> {
  const known = registryItems.some((item) => item.slug === slug);
  if (!known) {
    return { ok: false, counts: await getPurchaseCounts() };
  }
  const { data, error } = await getSupabase().rpc("mark_gift_purchased", {
    p_slug: slug,
  });
  if (error) console.error("Mark purchased failed:", error.message);
  return { ok: !error && data?.ok === true, counts: await getPurchaseCounts() };
}
