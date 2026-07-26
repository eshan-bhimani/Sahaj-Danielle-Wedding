import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FloralCorner, FloralDivider, FloralDot } from "@/components/Floral";
import { LightboxGallery, LightboxImage } from "@/components/Lightbox";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Photos — Danielle & Sahaj",
};

function photoSrc(file: string) {
  return file.startsWith("/") ? file : `/photos/${file}`;
}

function photoExists(file: string) {
  const rel = file.startsWith("/") ? file.slice(1) : join("photos", file);
  return existsSync(join(process.cwd(), "public", rel));
}

export default function PhotosPage() {
  /* Photos on disk are clickable and cycle in the lightbox; entries
   * still waiting on their image render a "coming soon" frame. */
  const display = photos.map((photo) => ({
    ...photo,
    src: photoSrc(photo.file),
    exists: photoExists(photo.file),
  }));
  const lightboxItems = display
    .filter((p) => p.exists)
    .map((p) => ({ src: p.src, caption: p.caption }));
  let lightboxIndex = -1;

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-20">
      <FloralCorner className="left-0 top-0 -translate-x-6 -translate-y-6" />
      <FloralCorner className="bottom-0 right-0 translate-x-6 translate-y-6 rotate-180" />

      <div className="relative mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-5xl tracking-[0.18em] text-blue-deep uppercase sm:text-6xl">
          Photos
        </h1>
        <FloralDivider className="my-8" />

        {/* The couple's story, in three lines */}
        <p className="font-script text-4xl leading-snug text-magenta sm:text-5xl">
          From high school sweethearts to forever
        </p>
        <p className="mt-5 text-lg leading-relaxed">
          Memories from our journey together{" "}
          <span aria-hidden="true" className="text-magenta">
            ♥
          </span>
        </p>
      </div>

      {/* Gallery — its own (wider) container so photos aren't capped by the
          max-w-2xl text column above. */}
      <LightboxGallery items={lightboxItems}>
        <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-3 gap-4 sm:gap-8">
          {display.map(({ file, caption, src, exists }) => {
            if (exists) lightboxIndex++;
            return (
              <figure key={file}>
                {exists ? (
                  <LightboxImage
                    index={lightboxIndex}
                    src={src}
                    alt={caption || "Photo of Danielle & Sahaj"}
                    className="w-full rounded-xl shadow-md"
                  />
                ) : (
                  <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue/30 bg-blue-pale/40 p-2 text-center">
                    <FloralDot />
                    <p className="font-script text-lg text-blue-deep sm:text-2xl">
                      Coming soon
                    </p>
                  </div>
                )}
                {caption && (
                  <figcaption className="mx-auto mt-2 text-xs italic leading-snug text-ink/80 sm:text-base">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </LightboxGallery>

      <div className="relative mx-auto max-w-2xl text-center">
        <FloralDivider className="mt-16" />
        <p className="mt-8 font-script text-3xl leading-snug text-blue-deep sm:text-4xl">
          To many more beautiful moments and cherished memories
        </p>
      </div>
    </section>
  );
}
