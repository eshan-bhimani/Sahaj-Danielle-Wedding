"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FloralCorner, FloralDivider, FloralUnderline } from "./Floral";

const links = [
  { href: "/", label: "Home" },
  { href: "/photos", label: "Photos" },
  { href: "/dress-code", label: "Dress Code" },
  { href: "/faqs", label: "Q + A" },
  { href: "/registry", label: "Registry" },
  { href: "/rsvp", label: "RSVP" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* Lock page scroll while the phone menu is up; Esc closes it */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-blue-pale bg-cream/90 backdrop-blur">
        {/* Phone: hamburger left, monogram centered.
            Laptop (sm+): monogram left, links row right — unchanged. */}
        <nav className="mx-auto grid max-w-5xl grid-cols-[2.75rem_1fr_2.75rem] items-center px-4 py-3 sm:flex sm:justify-between sm:px-6">
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-start justify-center gap-1.5 sm:hidden"
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <span className="h-0.5 w-7 bg-blue-deep" />
            <span className="h-0.5 w-7 bg-blue-deep" />
            <span className="h-0.5 w-7 bg-blue-deep" />
          </button>

          <Link
            href="/"
            className="justify-self-center font-script text-3xl text-magenta sm:justify-self-auto"
            onClick={() => setOpen(false)}
          >
            D &amp; S
          </Link>

          {/* Laptop links */}
          <ul className="hidden items-center gap-7 sm:flex">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex flex-col items-center font-serif text-lg tracking-widest uppercase transition-colors ${
                      active ? "text-blue-deep" : "text-ink hover:text-magenta"
                    } ${href === "/rsvp" ? "rounded-full bg-blue px-4 py-1.5 text-white hover:bg-blue-deep hover:text-white" : ""}`}
                  >
                    {label}
                    {active && <FloralUnderline className="h-2.5 w-16" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* spacer keeps the monogram centered on phones */}
          <span aria-hidden="true" className="sm:hidden" />
        </nav>
      </header>

      {/* Phone option menu — rendered OUTSIDE the header: its
          backdrop-blur would otherwise trap this fixed overlay
          inside the header strip. */}
      {open && (
        <div
          className="fixed inset-0 z-[90] overflow-y-auto bg-cream sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <FloralCorner className="bottom-0 right-0 translate-x-6 translate-y-6 rotate-180 opacity-70" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center text-3xl text-blue-deep transition-colors hover:text-magenta"
          >
            ✕
          </button>

          <nav className="flex flex-col items-stretch pt-24 pb-16 text-center">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center py-5 font-serif text-2xl tracking-[0.25em] uppercase transition-colors ${
                    active
                      ? "bg-blue-pale/50 text-blue-deep"
                      : "text-ink hover:text-magenta"
                  }`}
                >
                  {label}
                  {active && <FloralUnderline className="mt-1 h-3 w-20" />}
                </Link>
              );
            })}
            <FloralDivider className="mt-10" />
          </nav>
        </div>
      )}
    </>
  );
}
