/*
 * Hand-drawn-style floral SVG accents used across every page.
 * Colors reference the palette CSS variables so they stay in sync.
 */

function Blossom({
  cx,
  cy,
  r,
  color,
  center = "var(--bloom-gold)",
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  center?: string;
}) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const angle = (i * 72 * Math.PI) / 180;
    return (
      <ellipse
        key={i}
        cx={cx + Math.cos(angle) * r * 0.75}
        cy={cy + Math.sin(angle) * r * 0.75}
        rx={r * 0.62}
        ry={r * 0.42}
        transform={`rotate(${i * 72} ${cx + Math.cos(angle) * r * 0.75} ${cy + Math.sin(angle) * r * 0.75})`}
        fill={color}
      />
    );
  });
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={r * 0.32} fill={center} />
    </g>
  );
}

/** A horizontal vine with blossoms — used to divide sections. */
export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 360 48"
        className="h-9 w-72 sm:w-90"
        fill="none"
        role="presentation"
      >
        <path
          d="M20 24 C 70 8, 110 40, 180 24 S 290 8, 340 24"
          stroke="var(--bloom-leaf)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M78 21 q -4 -10 -14 -12 q 6 10 14 12 Z"
          fill="var(--bloom-olive)"
        />
        <path
          d="M256 30 q 4 10 14 12 q -6 -10 -14 -12 Z"
          fill="var(--bloom-olive)"
        />
        <Blossom cx={20} cy={24} r={8} color="var(--bloom-pink)" />
        <Blossom
          cx={180}
          cy={24}
          r={11}
          color="var(--bloom-blue)"
          center="var(--bloom-poppy)"
        />
        <Blossom cx={340} cy={24} r={8} color="var(--bloom-magenta)" />
        <circle cx={120} cy={28} r={3.5} fill="var(--bloom-gold)" />
        <circle cx={238} cy={20} r={3.5} fill="var(--bloom-poppy)" />
      </svg>
    </div>
  );
}

/** A sprig of leaves and blossoms for page corners. Rotate via className. */
export function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={`pointer-events-none absolute h-32 w-32 sm:h-44 sm:w-44 ${className}`}
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M8 8 C 40 30, 60 60, 70 110 M8 8 C 34 18, 80 30, 118 26"
        stroke="var(--bloom-leaf)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M40 30 q -14 -2 -22 8 q 14 4 22 -8 Z" fill="var(--bloom-olive)" />
      <path d="M60 62 q -14 0 -20 12 q 15 2 20 -12 Z" fill="var(--bloom-olive)" />
      <path d="M84 28 q -8 -12 -22 -12 q 6 13 22 12 Z" fill="var(--bloom-leaf)" />
      <Blossom cx={70} cy={112} r={11} color="var(--bloom-blue)" center="var(--bloom-gold)" />
      <Blossom cx={120} cy={26} r={9} color="var(--bloom-pink)" center="var(--bloom-magenta)" />
      <Blossom cx={16} cy={14} r={7} color="var(--bloom-poppy)" />
      <circle cx={96} cy={64} r={4} fill="var(--bloom-gold)" />
      <circle cx={44} cy={90} r={3} fill="var(--bloom-magenta)" />
    </svg>
  );
}

/** A dainty vine that underlines the active nav link. */
export function FloralUnderline({
  className = "h-3 w-24",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 14"
      className={className}
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M4 7 C 30 3, 90 11, 116 7"
        stroke="var(--bloom-leaf)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M34 6 q -5 -6 -12 -6 q 3 7 12 6 Z" fill="var(--bloom-olive)" />
      <Blossom cx={60} cy={7} r={5} color="var(--bloom-pink)" center="var(--bloom-gold)" />
      <circle cx={88} cy={8} r={2.5} fill="var(--bloom-poppy)" />
    </svg>
  );
}

/** Small single bloom, used as a bullet/icon. */
export function FloralDot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} aria-hidden="true">
      <Blossom cx={12} cy={12} r={7} color="var(--bloom-blue)" center="var(--bloom-gold)" />
    </svg>
  );
}
