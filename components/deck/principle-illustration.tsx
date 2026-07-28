import type { CSSProperties } from 'react'

/**
 * Minimal geometric diagrams that accompany the three takeaway rules in the
 * Principles phase — one per law. Notion/Anthropic-flat: line work, one accent
 * (utility orange), micro mono labels, lots of air. Colours come from the deck
 * tokens: `currentColor` (set to ink by the wrapper) for marks, muted grey for
 * scaffolding, and the orange accent for the one thing that carries meaning.
 */

const MONO: CSSProperties = {
  fontFamily: 'var(--font-mono-custom), ui-monospace, monospace',
  fontSize: '9px',
  letterSpacing: '0.12em',
}

const INK = 'currentColor'
const GREY = 'var(--muted-foreground)'
const ACCENT = 'var(--accent)'

const svgProps = {
  viewBox: '0 0 340 200',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  className: 'h-auto w-full text-foreground',
} as const

/** Fitts's Law — targets shrink left→right while the time-cost bars grow. */
function Fitts() {
  return (
    <svg {...svgProps} role="img" aria-label="Three targets shrinking left to right while the time to reach each one grows">
      {/* time axis */}
      <line x1="44" y1="152" x2="44" y2="58" stroke={GREY} strokeOpacity="0.4" />
      <path d="M40 64 L44 56 L48 64" stroke={GREY} strokeOpacity="0.4" />
      <text transform="translate(28 118) rotate(-90)" style={MONO} fill={GREY}>
        TIME
      </text>
      {/* baseline */}
      <line x1="44" y1="152" x2="300" y2="152" stroke={GREY} strokeOpacity="0.4" />
      {/* targets (shrinking) */}
      <circle cx="90" cy="74" r="22" fill={INK} />
      <circle cx="178" cy="74" r="12" fill={INK} />
      <circle cx="262" cy="74" r="5" fill={INK} />
      {/* time cost (growing) */}
      <rect x="83" y="136" width="14" height="16" fill={INK} fillOpacity="0.22" />
      <rect x="171" y="118" width="14" height="34" fill={INK} fillOpacity="0.22" />
      <rect x="255" y="92" width="14" height="60" fill={ACCENT} />
    </svg>
  )
}

/** Steering Law — steer a cursor down a long, thin corridor. */
function Steering() {
  return (
    <svg {...svgProps} role="img" aria-label="A long, thin corridor with a wandering path steered down its middle">
      {/* corridor walls */}
      <line x1="54" y1="89" x2="286" y2="89" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="111" x2="286" y2="111" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* steered path */}
      <path
        d="M54 100 C 96 90, 128 110, 168 100 S 244 90, 278 100"
        stroke={ACCENT}
        strokeWidth="2"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <path d="M278 100 l-10 -4 l3 4 l-3 4 z" fill={ACCENT} />
      {/* width caliper */}
      <line x1="40" y1="89" x2="40" y2="111" stroke={GREY} />
      <line x1="36" y1="89" x2="44" y2="89" stroke={GREY} />
      <line x1="36" y1="111" x2="44" y2="111" stroke={GREY} />
      <text x="24" y="103" style={MONO} fill={GREY}>
        W
      </text>
      {/* length caliper */}
      <line x1="54" y1="138" x2="286" y2="138" stroke={GREY} />
      <line x1="54" y1="134" x2="54" y2="142" stroke={GREY} />
      <line x1="286" y1="134" x2="286" y2="142" stroke={GREY} />
      <text x="170" y="132" textAnchor="middle" style={MONO} fill={GREY}>
        L
      </text>
    </svg>
  )
}

/** Target size — a tiny mark owning a generous ring of clear space. */
function TargetSize() {
  return (
    <svg {...svgProps} role="img" aria-label="A tiny mark centered in a large generous hit area of clear space">
      {/* neighbours — the space around the mark is its own */}
      <circle cx="52" cy="98" r="4" fill={INK} fillOpacity="0.22" />
      <circle cx="288" cy="98" r="4" fill={INK} fillOpacity="0.22" />
      {/* generous target / clear space */}
      <circle
        cx="170"
        cy="98"
        r="56"
        fill={ACCENT}
        fillOpacity="0.12"
        stroke={ACCENT}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      {/* the honest 3px mark */}
      <circle cx="170" cy="98" r="4" fill={INK} />
      {/* labels */}
      <line x1="170" y1="42" x2="170" y2="30" stroke={ACCENT} strokeOpacity="0.7" />
      <text x="170" y="24" textAnchor="middle" style={MONO} fill={ACCENT}>
        TARGET
      </text>
      <line x1="170" y1="102" x2="170" y2="168" stroke={GREY} strokeOpacity="0.5" />
      <text x="170" y="182" textAnchor="middle" style={MONO} fill={GREY}>
        3PX MARK
      </text>
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
