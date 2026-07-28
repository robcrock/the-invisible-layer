# The Invisible Layer — conference talk deck

A scrollytelling presentation for a data-visualization meetup talk called
**"The Invisible Layer."** The talk's thesis: *the mark you see is not the
target you touch.* Honest marks keep charts truthful; generous invisible hit
targets keep them usable; the invisible layer is what lets a chart have both.

The deck is built and playable. Each chart phase pins its interactive demo
beside the scrolling narrative and runs a repeatable measured arc:
**CHALLENGE → ROUND 1 (timed) → THE FIX (named law) → ROUND 2 → MEASURED
delta → IN YOUR WORK.** The audience generates the evidence live.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4 (tokens via `@theme` in CSS)
- Motion (`motion/react`, i.e. motion.dev) for animation
- D3 for the demo widgets — **math only** (see hard constraints)

## Hard constraints (do not violate — this is the talk's whole scope)

- **Declarative React for all DOM and interaction.** JSX renders every SVG
  element; native React event handlers (`onPointerMove`, `onClick`, etc.) drive
  every interaction.
- **D3 is imported for math only:** scales (`scaleLinear`, `scaleBand`),
  generators (`line`), `d3.bisector`, `d3.Delaunay`, `d3.quadtree`. That's it.
- **No imperative D3.** Never `d3.select()`, `.append()`, `.on()`, `.attr()`,
  or the general-update pattern. If you're reaching for a D3 selection, stop —
  render it in JSX instead.
- **No canvas. SVG only.**
- **Native scroll only** — no wheel hijacking, no scroll-snap, no scroll-jacking.
- **Never start a timer from scroll.** Scroll may *arm* a game (show its START
  button); the clock starts only on a presenter click.
- Respect `prefers-reduced-motion` everywhere (pulses, morphs, transitions).
- These constraints are the *point* of the talk. Honor them even when a
  shortcut would be shorter.

## The signature motif

The recurring device is a **debug toggle** ("HIT TARGETS") that reveals the
normally invisible hit-target layer as translucent **utility orange
(`#D95600`)** — "here's what your mouse actually sees." The color choice is the
design system's argument: in dieter-grid (Braun), orange is reserved for the
one control that does something, and in this deck the orange layer IS the one
thing that responds. `DebugToggle`/`DebugLayer` in
`components/demos/shared/debug-toggle.tsx` are the shared primitives — every
widget's reveal must look and behave identically.

**Single-accent discipline (load-bearing):** orange appears only as
(1) the one primary action button visible at a time (START/RESET),
(2) the debug layer + live target pulse/flash + the results delta line,
(3) the progress bar, (4) the active beat square. Kickers, phase numbers, and
slot ids are metadata → grey. No second accent, no gradients, no shadows, no
blur.

## Architecture

- `lib/content.ts` — all talk copy as typed data. `Phase[]` (each with
  `demo?: string` — a `demoRegistry` key that selects the pinned layout) and
  `Beat[]` (each with `demoStage?: string` — the stage the pinned demo adopts
  when that beat activates). `demoCopy` holds every string a widget renders.
  **Every wording change happens here, never in components.**
- `components/deck/phase-section.tsx` — the pinned scrolly layout: compact
  phase header, narrative beats scrolling left (5fr), the phase's demo sticky
  and centered right (7fr) for the whole phase, beat-square rail beneath it.
  Mobile pins the demo on top. Phases without `demo` render a centered prose
  column. Derives the current stage as *the last defined `demoStage` at or
  before the active beat* and passes it as one prop: `<Demo stage={stage} />`.
- `components/deck/beat-block.tsx` — one talking point; `useInView` margin
  `-40% 0px -40% 0px` activates it; inactive beats dim (opacity only).
- `components/demos/index.ts` — `demoRegistry: Record<string,
  ComponentType<{ stage?: string }>>`. Unregistered ids fall back to the dashed
  `DemoSlot` placeholder.

### Stage-sync contract (scroll-synced with presenter override)

`components/demos/shared/use-stage-sync.ts` applies a scroll-driven stage
exactly once per *change* of stage value. Rules:

1. Widgets work standalone with `stage` omitted (defaults = first stage).
2. Manual overrides (segmented controls, debug toggle, slider) persist through
   scroll jitter within a beat; a *new* stage from scroll wins over them.
3. Games **arm, never autostart** — `arm` shows the START overlay; `start`
   comes only from the button.
4. Stage events never clear recorded results; only RESET returns a game to
   idle. Stage events are ignored while a round is `running`.
5. `arm 2` while nothing has been played arms round 1 instead — rounds run in
   order or the comparison is meaningless.
6. Unknown stage strings are no-ops (content typos degrade gracefully).

### Shared game primitives

- `shared/use-round-game.ts` — the two-round reducer (`idle → armed → running
  → between → results`), rAF display clock, 25s mercy cap, hit/miss/wrongHit
  counters.
- `shared/round-results.tsx` — the one results table every game shows (round 1
  vs round 2, avg per hit, delta template, framing, RESET).
- `shared/stage-overlay.tsx` — `StageOverlay` (armed/results panel) +
  `PanelButton` (the solid orange switch).
- `shared/demo-stage.tsx` — card chrome: slot id, controls row, 16:9 body
  (viewBox 640×360 ≈ CSS px at the rendered width — don't widen the demo
  column past ~650px or "3px bar / 2px line" stop being honest claims),
  hint + instrumentation footer.
- `shared/data.ts` — seeded deterministic data (`makeSeries`, `makeScatter`,
  `BAR_DATA`, `makeTargetSequence`, `LINE_TARGETS`, `SCATTER_TARGETS`). Module
  scope so SSR/client SVG is byte-identical.

### The widgets (id → file)

| id | file | arc |
|---|---|---|
| `cold-open-pixel-hunt` | `pixel-hunt.tsx` | START THE HUNT → catch date #078 on the 2px stroke (hold 500ms or click) → readout (time, % on line, tooltip deaths). Stages: `hunt` / `honest` / `reveal`. |
| `bars-fitts` | `bars-fitts.tsx` | Hover the honest chart → morph to rudely-short data → round 1 on drawn rects → band reveal (debug on) → round 2 on invisible bands → Fitts delta. Stages: `mark` / `game-1` / `band` / `game-2` / `results`. |
| `lines-trace` | `lines-trace.tsx` | The cold open's dataset. Trace explore → round 1 click the stroke at five dates → bisector overlay reveal → round 2 click anywhere → Steering delta → hoverable data-anchored tooltip. Stages: `trace` / `game-1` / `computed` / `game-2` / `results` / `craft`. |
| `scatter-voronoi` | `scatter-voronoi.tsx` | Twin-steal explore → round 1 find five ringed 3px dots (misses + wrong hits) → Voronoi tessellation reveal → round 2 via `delaunay.find` (misses impossible) → radius clamp coda with slider. Stages: `naive` / `game-1` / `voronoi` / `game-2` / `results` / `clamp`. |
| `the-turn-heatmap` | `the-turn-heatmap.tsx` | The counterexample: hover-anywhere cells, and the debug reveal lands exactly on the marks — zero gap, "live pixels: 100%". No rounds on purpose: there is nothing to fix. Stages: `hover` / `coverage`. |

## Design (dieter-grid / Braun functional minimalism)

Source: designdotmd.directory/d/dieter-grid. Single light theme; tokens live in
`app/globals.css` **and** `app/theme.css` (imported after globals so it wins
the cascade against shadcn tokens — keep the two blocks byte-identical, don't
consolidate them).

- Colors: page `#E7E5E1` (concrete), surfaces `#F3F1EC`, ink `#0F1113`,
  metadata grey `#6B6F74`, hairline borders `rgba(107,111,116,.3)`, accent
  `#D95600` utility orange only.
- Type: Inter (display/body — display ~3.5rem w500 −0.02em, phase titles
  1.9rem w500, beat titles 1.35rem w500, body 0.95rem/1.55) + JetBrains Mono
  (labels 0.72rem, tracking 0.08em, uppercase).
- Radii 0/2/4px (`--radius-sm/md/lg`). Spacing rhythm 8/16/32. Flat on
  purpose: no gradients, no shadows, no blur.
- `#D95600` on the light surfaces is ~3.6:1 — fine for large UI/debug shapes
  and the solid button, not for small text. Small text is ink or grey.

## Working style

- **One concern per change.** Land a layout change, then copy, then a widget —
  don't refactor three things at once.
- **Copy is data.** Edit `content.ts`, not components.
- Match the existing conventions before introducing new ones; read before
  writing.
- Keep each widget standalone (own state, bounded container, `stage` optional)
  so it lifts cleanly into robcrock.com's LAB later.
- Dev: the main checkout runs `next dev` on :3000 — verification servers use
  another port (e.g. `pnpm dev -p 3101`).

## Reference: full phase/beat outline

**00 Cold open** (CHALLENGE hunt → "the chart is honest" → THESIS + reveal) ·
**01 The Principles** (prose preview — names the three takeaways up front: Fitts's
Law, the Steering Law, and target size / WCAG's spacing exception, each tagged with
the chapter where you'll feel it) · **02 Bars** (3px bar → ROUND 1 drawn rects →
band targets + `fill:none` gotcha → ROUND 2 bands → Fitts's Law measured → "target
the category" takeaway) · **03 Lines** (trace the cold open's line → ROUND 1 five
dates on the stroke → bisector pivot → ROUND 2 computed → Steering Law measured,
#078 pays off → why tooltips vanish) · **04 Scatter** (twin-steal → ROUND 1 find
five dots → Voronoi reveal → ROUND 2 nearest-point → misses hit zero, bubble cursor
+ WCAG aside → radius clamp tradeoff) · **05 The turn** (live heatmap counterexample
— hover anywhere, debug reveals zero gap, 100% coverage; the take-home test) ·
**06 Close** (THE THREE PRINCIPLES reprise → invisible target / unmissable feedback;
takeaway: *the mark stays honest to the data, the target stays generous to the
human*).

The three takeaways (Fitts, Steering, target size) are now **previewed after the
Preamble (01 The Principles) and reprised at the Close** — the classic tell-them /
tell-them / tell-them arc. Inside the demo chapters the named laws are still
**payoffs delivered after the felt experience, never the spine**: the audience plays
first and the `MEASURED` beat names what they just measured. The bubble cursor stays
a Scatter-chapter technique, not a headline takeaway (it's a result, not a law).
