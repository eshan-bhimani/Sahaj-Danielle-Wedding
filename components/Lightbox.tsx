"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* Click-to-enlarge lightbox with a cycling carousel.
 *
 * Wrap a page section in <LightboxGallery items={[{src, caption}]}>
 * and render each clickable picture with <LightboxImage index={i}>.
 * Arrows, swipe, and ←/→ keys cycle through the page's photos;
 * Esc, the ✕, or clicking the backdrop closes. */

type LightboxItem = { src: string; caption?: string };

const LightboxContext = createContext<{ open: (index: number) => void } | null>(
  null,
);

export function LightboxImage({
  index,
  src,
  alt,
  className = "",
}: {
  index: number;
  src: string;
  alt: string;
  className?: string;
}) {
  const ctx = useContext(LightboxContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.open(index)}
      className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-pale"
      aria-label={`View larger: ${alt}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} />
    </button>
  );
}

export function LightboxGallery({
  items,
  children,
}: {
  items: LightboxItem[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setIndex((current) =>
        current === null
          ? current
          : (current + delta + items.length) % items.length,
      );
    },
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  const item = index === null ? null : items[index];

  return (
    <LightboxContext.Provider value={{ open: setIndex }}>
      {children}

      {item && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/95 px-4 py-10"
          onClick={close}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) > 40) step(delta < 0 ? 1 : -1);
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close photo viewer"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/25"
          >
            ✕
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/25 sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition-colors hover:bg-white/25 sm:right-6"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.caption ?? "Photo"}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
          {item.caption && (
            <p
              onClick={(e) => e.stopPropagation()}
              className="mt-4 max-w-xl text-center text-lg italic leading-relaxed text-white/90"
            >
              {item.caption}
            </p>
          )}
          {items.length > 1 && (
            <p className="mt-2 text-sm tracking-[0.2em] text-white/60">
              {index! + 1} / {items.length}
            </p>
          )}
        </div>
      )}
    </LightboxContext.Provider>
  );
}
