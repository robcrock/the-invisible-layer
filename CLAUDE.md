# The Invisible Layer — conference talk deck

A scrollytelling presentation for a data-visualization meetup talk called
**"The Invisible Layer."** The talk's thesis: *the mark you see is not the
target you touch.* Honest marks keep charts truthful; generous invisible hit
targets keep them usable; the invisible layer is what lets a chart have both.

This repo was scaffolded in v0 (Vercel) and deployed there. The scaffold is the
**shell** — sticky-phase scrolling, content model, placeholder demo slots. The
remaining work is building the **real interactive demo widgets** that mount into
those slots.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Motion (`motion/react`, i.e. motion.dev) for animation
- D3 for the demo widgets — **math only** (see hard constraints)

## Hard constraints (do not violate — this is the talk's whole scope)

- **Declarative React for all DOM and interaction.** JSX renders every SVG
  element; native React event handlers (`onPointerMove`, `onClick`, etc.) drive
  every interaction.
- **D3 is imported for math only:** scales (`scaleLinear`, `scaleBand`),
  `d3.max`, generators (`line`, `area`), `d3.bisector`, `d3.Delaunay`,
  `d3.quadtree`. That's it.
- **No imperative D3.** Never `d3.select()`, `.append()`, `.on()`, `.attr()`,
  or the general-update pattern. If you're reaching for a D3 selection, stop —
  render it in JSX instead.
- **No canvas.** SVG only.
- These constraints are the *point* of the talk. Honor them even when imperative
  D3 would be shorter.

## The signature motif

The talk's recurring device is a **debug toggle** that reveals the normally
invisible hit-target layer as a translucent **hot-pink (#FF2E86)** overlay —
"here's what your mouse actually sees." This is both the demos' teaching move and
the deck's visual identity (progress bar, active dots, kickers, slot borders all
use the same pink). Build a shared toggle/overlay primitive the widgets reuse,
so the reveal looks and behaves identically across bars, lines, and scatter.

## Repo structure (reconcile with actual v0 output)

The v0 prompt asked for roughly this shape; the generated code may differ
slightly. Read what's actually here first and adapt — don't assume.

- `content.ts` — all talk copy as typed data (`Phase[]`, each with `Beat[]`).
  Every wording change happens here, never in components.
- `app/page.tsx` — composes `ProgressBar` + maps phases to `PhaseSection`.
- `PhaseSection` — the sticky left panel + maps beats to `BeatBlock`.
- `BeatBlock` — one talking point; renders a `DemoSlot` when `beat.demoSlot` is set.
- `DemoSlot` — 16:9 dashed placeholder keyed by id. **These are what the real
  widgets replace.**

Scroll mechanic: CSS `position: sticky` per phase section + Motion `useInView`
(activation margin ~`-40% 0px -40% 0px`) to dim/blur inactive beats. Native
scroll only — no wheel hijacking, no scroll-jacking. Respect
`prefers-reduced-motion`.

## The demo roadmap — the real remaining work

Each `DemoSlot` id below maps to a widget to build. All share the debug-toggle /
pink-overlay motif. Build them isolated (each self-contained, own state) so they
can double as **LAB specimens on robcrock.com** later.

| slot id | chart | what it teaches | core geometry |
|---|---|---|---|
| `cold-open-pixel-hunt` | dense line | the frustration — naive hover, only the 2px path is the target | none (deliberately painful) |
| `bars-before-after` | bar | band targets vs rect-only; pink reveals the bands | full-height `scaleBand` step rects |
| `fitts-timer` | two targets | interaction, measured | 3px bar vs wide band, timed |
| `line-before-after` | line | trace-the-line vs computed target | one overlay rect + `d3.bisector` on x |
| `scatter-before-after` | scatter | tiny-dot misses and wrong-hits | naive per-dot hitboxes |
| `voronoi-reveal` | scatter | every pixel belongs to a point; then clamp it | `d3.Delaunay.find`, then `d3.quadtree.find(x,y,r)` |

### Per-widget notes

- **cold-open-pixel-hunt** — Should feel bad on purpose. Only the visible ~2px
  path receives pointer events; reading a specific value requires pixel-hunting.
  Optional debug toggle to show how thin the target actually is.
- **bars-before-after** — Toggle between naive (hover only the drawn rect) and
  band targets (transparent rects spanning full column height + full `scaleBand`
  step including padding). Pink debug overlay makes the bands visible. Note the
  SVG gotcha in a comment: `fill="none"` swallows pointer events — use
  `fill="transparent"` or `pointerEvents="all"`.
- **fitts-timer** — The one quantified moment. Two rounds: click a 3px bar N
  times, then a wide band N times, timer running; show the per-click delta and a
  one-line Fitts framing. Barely needs D3 (a `scaleBand` at most). Keep it dead
  simple and self-contained.
- **line-before-after** — Ladder of fixes, worst to best, but the demo's job is
  the pivot: a single overlay rect over the plot, `onPointerMove` reads pointer
  x, `d3.bisector` snaps to nearest datum. **The target is computed, not drawn** —
  that's the hinge of the whole talk. Tooltip should anchor to the *snapped
  point*, not the cursor, and be hoverable (this is why most tooltips vanish).
- **scatter-before-after** — Tiny dots, show both failure modes: outright misses
  and hovering the wrong (visually-near-but-not-nearest) point.
- **voronoi-reveal** — The climax. `d3.Delaunay.from(points)`, `delaunay.find(x,y)`
  for nearest-point lookup with zero dead space. Pink toggle overlays the Voronoi
  cells (`voronoi.renderCell` path data rendered as JSX `<path>`). Then a *second*
  toggle adds the radius clamp via `d3.quadtree().find(x, y, radius)` — surface
  the dead-zone-vs-mis-trigger tradeoff as a real design decision with no
  universal answer, not a bug fix.

## Design

Dark presentation-theater: near-black `#0A0A0C`, off-white type, lots of air,
flat (no cards, no shadows). Accent `#FF2E86` (the debug pink). Monospace for
kickers / phase numbers / slot ids; clean grotesque for titles. Phase titles
large (`clamp` ~3–5rem), beat titles ~1.75rem, body ~1.05rem, ~55ch measure.

## Working style

- **One concern per change.** Land the scroll/sticky behavior, then typography,
  then a widget — don't refactor three things at once.
- **Copy is data.** Edit `content.ts`, not components.
- Match the existing scaffold's conventions before introducing new ones; read
  before writing.
- When building a widget, keep it a standalone component with its own state and
  a clean bounded container, so it lifts cleanly into robcrock.com's LAB later.

## Reference: full phase/beat outline

Phases: **00 Cold open** (pixel-hunt misery → "the chart is honest" → thesis) ·
**01 Bars** (band targets, the `fill:none` gotcha, the Fitts timer, "invisible
targets have no affordance") · **02 Lines** (trace-the-line misery, Steering Law
aside, the bisector pivot, why tooltips vanish) · **03 Scatter** (tiny-dot
failures, the Voronoi reveal, "spec and algorithm converged" aside, the radius
clamp tradeoff) · **04 The turn** (heatmap needs no layer — proof by negation;
the take-home test: *how much of my chart responds vs. how much should?*) ·
**05 Close** (invisible target / unmissable feedback; takeaway: *the mark stays
honest to the data, the target stays generous to the human*).

The asides (Fitts, Steering Law, WCAG spacing exception, bubble cursor) are
**payoffs delivered after the frustration demo, never the spine** — the felt
experience leads, the named law rewards it.
