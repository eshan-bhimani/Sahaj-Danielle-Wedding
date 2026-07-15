/* The wedding registry. Add gifts here — the Registry page renders
 * whatever is in this list.
 *
 *   brand      shown small above the name
 *   name       gift name
 *   price      display string ("$325")
 *   url        where "View Gift" goes — Amazon or the product's site
 *   slug       optional; a photo at public/registry/<slug>.jpg is shown
 *              on the card automatically once the file exists
 *   needs      how many the couple would like (default 1)
 *   purchased  flip to true once bought so guests see it's taken
 */

export type RegistryItem = {
  brand: string;
  name: string;
  price: string;
  url: string;
  slug?: string;
  needs?: number;
  purchased?: boolean;
};

export const registryItems: RegistryItem[] = [
  {
    brand: "YETI",
    name: "Tundra 45 Cooler",
    price: "$325",
    url: "https://www.amazon.com/s?k=YETI+Tundra+45+Cooler",
    slug: "tundra-45",
  },
  {
    brand: "YETI",
    name: "Tundra 35 Hard Cooler",
    price: "$295",
    url: "https://www.amazon.com/s?k=YETI+Tundra+35+Cooler",
    slug: "tundra-35",
  },
  /* 12 more gifts to add — brand, name, price, url */
];
