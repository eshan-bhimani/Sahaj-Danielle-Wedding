/* The wedding registry. Add or edit gifts here — the Registry page
 * renders whatever is in this list.
 *
 *   slug          stable id; purchase counts in Supabase key off this,
 *                 and a photo at public/registry/<slug>.jpg is shown
 *                 automatically once the file exists
 *   brand/name    shown on the card
 *   price         number, used by the price filters
 *   priceDisplay  what guests see ("$149.99")
 *   url           where "View Gift" goes — swap the Amazon-search
 *                 stand-ins for exact product links anytime
 *   needs         how many the couple would like (default 1)
 *
 * Purchased state does NOT live here — guests mark gifts purchased on
 * the site and that's stored in Supabase (registry_purchases table),
 * so it persists for every visitor. To correct a mistaken mark, edit
 * that table in the Supabase dashboard.
 */

export type RegistryItem = {
  slug: string;
  brand: string;
  name: string;
  price: number;
  priceDisplay: string;
  url: string;
  needs?: number;
};

const amazon = (q: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;

export const registryItems: RegistryItem[] = [
  {
    slug: "tundra-45",
    brand: "YETI",
    name: "Tundra 45 Cooler",
    price: 325,
    priceDisplay: "$325",
    url: amazon("YETI Tundra 45 Cooler"),
  },
  {
    slug: "tundra-35",
    brand: "YETI",
    name: "Tundra 35 Hard Cooler",
    price: 295,
    priceDisplay: "$295",
    url: amazon("YETI Tundra 35 Hard Cooler"),
  },
  {
    slug: "luxe-sateen-duvet",
    brand: "Brooklinen",
    name: "Luxe Sateen Duvet Cover",
    price: 189,
    priceDisplay: "$189",
    url: amazon("Brooklinen Luxe Sateen Duvet Cover"),
  },
  {
    slug: "henckels-knife-block",
    brand: "Henckels",
    name: "Statement 15-Piece Knife Block Set",
    price: 149.99,
    priceDisplay: "$149.99",
    url: amazon("Henckels Statement 15-Piece Knife Block Set"),
  },
  {
    slug: "miko-ibuki-purifier",
    brand: "Miko",
    name: "IBUKI M Air Purifier with HEPA filter",
    price: 139,
    priceDisplay: "$139",
    url: amazon("Miko IBUKI M Air Purifier HEPA"),
  },
  {
    slug: "miko-towel-warmer",
    brand: "Miko",
    name: "Nest Towel Warmer",
    price: 119.99,
    priceDisplay: "$119.99",
    url: amazon("Miko Nest Towel Warmer"),
  },
  {
    slug: "tota-laundry-basket",
    brand: "Joseph Joseph",
    name: "Tota Laundry Basket",
    price: 99.99,
    priceDisplay: "$99.99",
    url: amazon("Joseph Joseph Tota Laundry Basket"),
  },
  {
    slug: "bd-air-purifier",
    brand: "BLACK+DECKER",
    name: "Tabletop 3-Stage Air Purifier",
    price: 86.99,
    priceDisplay: "$86.99",
    url: amazon("BLACK+DECKER Tabletop 3-Stage Air Purifier"),
  },
  {
    slug: "rambler-colster-2pk",
    brand: "YETI",
    name: "Rambler 12 oz. Colster Can Insulator, Set of 2",
    price: 55,
    priceDisplay: "$55",
    url: amazon("YETI Rambler 12 oz Colster Can Insulator Set of 2"),
  },
  {
    slug: "cooper-towel-set",
    brand: "Great Bay Home",
    name: "Cooper 6-Piece Cotton Towel Set",
    price: 54.99,
    priceDisplay: "$54.99",
    url: amazon("Great Bay Home Cooper 6-Piece Cotton Towel Set"),
    needs: 2,
  },
  {
    slug: "kathy-ireland-sheets",
    brand: "Kathy Ireland",
    name: "1000 Thread Count Egyptian Cotton Rich 6-Piece Sheet Set",
    price: 49.99,
    priceDisplay: "$49.99",
    url: amazon("Kathy Ireland 1000 Thread Count Egyptian Cotton Sheet Set"),
  },
  {
    slug: "jj-multi-prep",
    brand: "Joseph Joseph",
    name: "Multi-Prep™ Compact Chopper, Grater and Slicer Set",
    price: 45.99,
    priceDisplay: "$45.99",
    url: amazon("Joseph Joseph Multi-Prep Compact Chopper Grater Slicer Set"),
  },
  {
    slug: "greyson-bathmat",
    brand: "Safavieh",
    name: "Greyson Striped Bathmat, Set of 2",
    price: 35.36,
    priceDisplay: "$35.36",
    url: amazon("Safavieh Greyson Striped Bathmat Set of 2"),
  },
  {
    slug: "nordic-baking-set",
    brand: "Nordic Ware",
    name: "Naturals 3-Piece Baking Set",
    price: 32,
    priceDisplay: "$32",
    url: amazon("Nordic Ware Naturals 3-Piece Baking Set"),
  },
];
