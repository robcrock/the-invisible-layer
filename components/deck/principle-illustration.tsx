/**
 * Minimal geometric diagrams that accompany the three takeaway rules in the
 * Principles phase — one per law. Notion/Anthropic-flat: line work, one accent
 * (utility orange), lots of air. Each SVG's background rect is dropped so it
 * sits transparent on the card surface, and colours map to the deck tokens:
 * `currentColor` (set to ink by the wrapper) and `var(--accent)`.
 */

const svgProps = {
  viewBox: '0 0 286 168',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  className: 'h-auto w-full text-foreground',
} as const

/** Fitts's Law — a large, easy target beside a small, costly one. */
function Fitts() {
  return (
    <svg
      {...svgProps}
      role="img"
      aria-label="A large outlined target beside a small orange one"
    >
      <circle cx="78" cy="78" r="44" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="226" cy="78" r="6" fill="var(--accent)" />
    </svg>
  )
}

/** Steering Law — a path that gets harder, shading from ink to orange. */
function Steering() {
  return (
    <svg
      {...svgProps}
      role="img"
      aria-label="A squiggling path that shades from ink to orange toward its end, showing the trace getting harder as it runs on"
    >
      <defs>
        <linearGradient
          id="steering-path"
          x1="24"
          y1="84"
          x2="262"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0F1113" />
          <stop offset="58%" stopColor="#0F1113" />
          <stop offset="84%" stopColor="#D95600" />
          <stop offset="100%" stopColor="#D95600" />
        </linearGradient>
      </defs>
      <path
        d="M24 86 C43 61, 63 61, 82 84 C100 106, 119 108, 136 84 C154 58, 174 58, 191 83 C208 107, 228 107, 262 76"
        fill="none"
        stroke="url(#steering-path)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Target size — a small mark owning a generous, softly filled target. */
function TargetSize() {
  return (
    <svg
      {...svgProps}
      role="img"
      aria-label="A small mark centered inside a generous, softly filled target"
    >
      <rect
        x="104"
        y="34"
        width="78"
        height="78"
        rx="18"
        ry="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line x1="143" y1="63" x2="143" y2="83" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <line x1="133" y1="73" x2="153" y2="73" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const registry: Record<string, () => React.ReactElement> = {
  fitts: Fitts,
  steering: Steering,
  'target-size': TargetSize,
}

export function PrincipleIllustration({ name }: { name: string }) {
  const Illustration = registry[name]
  if (!Illustration) return null
  return <Illustration />
}
