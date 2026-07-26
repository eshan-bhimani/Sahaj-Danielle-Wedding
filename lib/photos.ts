/* The Photos page gallery. Add a photo by dropping the image into
 * public/photos/ and adding an entry here — the caption is the story
 * behind the photo, shown right beneath it.
 *
 * `file` is resolved inside public/photos/, unless it starts with "/"
 * (e.g. "/proposal.jpg" uses the hero photo at public/proposal.jpg).
 * Photos not yet on disk show an elegant "coming soon" frame, so it's
 * safe to write the list before uploading the images. */

export type WeddingPhoto = {
  file: string;
  caption: string;
};

/* Order is grouped in rows of 3 (the gallery is a 3-column grid) so every
 * row holds photos of the same orientation/aspect ratio — mixing a
 * landscape or square photo into a row of portraits looked wrong. Checked
 * real pixel dimensions via `sips` for every file:
 *   - landscape trio: proposal-bridge + proposal-reveal-bw (2304x1536) and
 *     tuscany (2048x1536) — the only 3 landscape photos in the set.
 *   - 0.667-ratio trio: proposal-tree + savannah-fountain + formal-night-
 *     silver (all 1536x2304).
 *   - tall-portrait trio: holiday-toast (1179x2096), botanical-garden
 *     (1195x1979), graduation-2021 (1346x2048) — grouped together since
 *     none of them match the standard 1536x2048 ratio, but they're closer
 *     to each other than to anything else.
 *   - photo-booth (1583x1536, nearly square) has no real match; paired
 *     with its closest neighbors (standard-ratio portraits).
 *   - everything else is 1536x2048 (or equivalent ratio) and grouped
 *     straightforwardly.
 * This means row order is no longer pure chronology — some photos moved a
 * few slots from their date-accurate position to make their row match.
 * When adding new photos, group them by aspect ratio the same way, or
 * this'll look mismatched again. Real-date evidence (see prior git history
 * for the exact sources) still holds for: gameday + cliff-overlook (Jul 18,
 * 2026), savannah-fountain (Mar 21, 2026), landmark-diner (Jan 3, 2026),
 * botanical-garden (Aug 23, 2025), formal-night-silver (Feb 21, 2025),
 * fireplace-lights (May 31, 2024), brick-wall-hug (Mar 1, 2024),
 * stone-door-corsage (Jan 13, 2024), white-coat (Sep 16, 2023),
 * golden-hour-1 (Sep 8, 2023), pisa (Jul 21, 2023), spanish-steps +
 * pantheon (Jul 20, 2023), assisi (Jul 19, 2023), tuscany (Jul 18, 2023),
 * malibu-coast (May 25, 2023), graduation-2021 (2021). Everything else
 * (proposal cluster, photo-booth, dance-floor, music-festival,
 * golden-hour-2, christmas-wreath, front-door-summer) is still an
 * unverified visual-cues guess. */
export const photos: WeddingPhoto[] = [
  { file: "/proposal.jpg", caption: "" },
  { file: "gameday.jpg", caption: "Between the hedges." },
  { file: "cliff-overlook.jpg", caption: "Somewhere with a view, just the two of us." },

  { file: "proposal-bridge.jpg", caption: "" },
  { file: "proposal-reveal-bw.jpg", caption: "" },
  { file: "tuscany.jpg", caption: "Tuscan hills and good light." },

  { file: "proposal-tree.jpg", caption: "" },
  { file: "savannah-fountain.jpg", caption: "An afternoon in Savannah." },
  { file: "formal-night-silver.jpg", caption: "" },

  { file: "holiday-toast.jpg", caption: "Raising a glass together." },
  { file: "botanical-garden.jpg", caption: "" },
  { file: "graduation-2021.jpg", caption: "" },

  { file: "malibu-coast.jpg", caption: "Chasing views along the California coast." },
  { file: "photo-booth.jpg", caption: "Photo booth shenanigans." },
  { file: "dance-floor.jpg", caption: "Dancing the night away." },

  { file: "proposal-ring-deck.jpg", caption: "" },
  { file: "landmark-diner.jpg", caption: "Late-night diner runs." },
  { file: "fireplace-lights.jpg", caption: "String lights and good company." },

  { file: "brick-wall-hug.jpg", caption: "" },
  { file: "stone-door-corsage.jpg", caption: "" },
  { file: "golden-hour-2.jpg", caption: "Making each other laugh, per usual." },

  { file: "white-coat.jpg", caption: "" },
  { file: "golden-hour-1.jpg", caption: "Golden hour, as always." },
  { file: "pisa.jpg", caption: "" },

  { file: "spanish-steps.jpg", caption: "Rome, taking it all in." },
  { file: "pantheon.jpg", caption: "" },
  { file: "assisi.jpg", caption: "" },

  { file: "music-festival.jpg", caption: "A day of music together." },
  { file: "christmas-wreath.jpg", caption: "" },
  { file: "front-door-summer.jpg", caption: "Simpler days." },
  /* More memories to add:
  { file: "photo-2.jpg", caption: "The story behind this one…" },
  */
];
