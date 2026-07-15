"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/photos", label: "Photos" },
  { href: "/dress-code", label: "Dress Code" },
  { href: "/faqs", label: "FAQs" },
  { href: "/registry", label: "Registry" },
  { href: "/rsvp", label: "RSVP" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-pale bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-script text-3xl text-magenta"
          onClick={() => setOpen(false)}
        >
          D &amp; S
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 sm:flex">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-serif text-lg tracking-widest uppercase transition-colors ${
                    active
                      ? "border-b-2 border-poppy text-blue-deep"
                      : "text-ink hover:text-magenta"
                  } ${href === "/rsvp" ? "rounded-full bg-blue px-4 py-1.5 text-white hover:bg-blue-deep hover:text-white border-0" : ""}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 sm:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={`h-0.5 w-6 bg-blue-deep transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 bg-blue-deep ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 bg-blue-deep transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul className="border-t border-blue-pale bg-cream px-6 pb-6 pt-3 sm:hidden">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 text-center font-serif text-xl tracking-widest uppercase ${
                    active ? "text-magenta" : "text-ink"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
