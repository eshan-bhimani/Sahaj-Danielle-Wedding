"use client";

import { useEffect, useState } from "react";

/* Wedding day: May 22, 2027 (matches the "days to go" count on the
 * original site). Computed client-side so it stays current. */
const WEDDING_DAY = new Date(2027, 4, 22);

export default function Countdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setDays(
      Math.max(0, Math.round((WEDDING_DAY.getTime() - today.getTime()) / 86_400_000)),
    );
  }, []);

  /* Render a stable placeholder until mounted to avoid hydration mismatch */
  return (
    <p className="font-serif text-xl tracking-[0.25em] text-poppy uppercase sm:text-2xl">
      {days === null ? " " : `${days} days to go!`}
    </p>
  );
}
