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

export const photos: WeddingPhoto[] = [
  {
    file: "/proposal.jpg",
    caption: "The moment it all became forever.",
  },
  /* More memories to add:
  { file: "photo-2.jpg", caption: "The story behind this one…" },
  */
];
