// All demo data is deterministic: seeded PRNG, computed at module scope,
// so server and client render byte-identical SVG (no hydration mismatch).

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type SeriesPoint = { x: number; y: number }

// Jittery random walk in data units: x = 0..n-1, y ≈ 0..100.
export function makeSeries(seed: number, n: number): SeriesPoint[] {
  const rand = mulberry32(seed)
  const pts: SeriesPoint[] = []
  let y = 50
  for (let i = 0; i < n; i++) {
    y += (rand() - 0.5) * 14
    y += Math.sin(i / 7) * 2.5
    y = Math.max(4, Math.min(96, y))
    pts.push({ x: i, y })
  }
  return pts
}

export type ScatterPoint = { id: string; x: number; y: number }

// Clustered scatter in data units 0..100. Deliberately plants:
// - near-coincident pairs (ε-separated, never identical — Delaunay-safe)
//   so DOM order steals the hover from the visually-targeted point
// - one isolated outlier so the radius clamp's dead zone has a payoff
export function makeScatter(seed: number, n: number): ScatterPoint[] {
  const rand = mulberry32(seed)
  const centers = [
    { x: 28, y: 34, r: 13 },
    { x: 62, y: 62, r: 15 },
    { x: 76, y: 26, r: 10 },
    { x: 40, y: 74, r: 11 },
  ]
  const pts: ScatterPoint[] = []
  const base = n - 7 // reserve room for planted pairs + outlier
  for (let i = 0; i < base; i++) {
    const c = centers[Math.floor(rand() * centers.length)]
    // Box-Muller-ish spread around the cluster center
    const a = rand() * Math.PI * 2
    const d = (rand() + rand()) * 0.5 * c.r
    const x = Math.max(3, Math.min(97, c.x + Math.cos(a) * d))
    const y = Math.max(3, Math.min(97, c.y + Math.sin(a) * d))
    pts.push({ id: '', x, y })
  }
  // Planted near-coincident pairs: the second point of each pair renders
  // later, so it wins naive hit-testing over the first. Separation is
  // tight enough (< dot radius) that the twin covers the target's center —
  // aiming dead-on still yields the wrong name — but never zero, which
  // would degenerate the Delaunay cells.
  const pairs: Array<[ScatterPoint, ScatterPoint]> = [
    [
      { id: '', x: 61.2, y: 60.8 },
      { id: '', x: 61.55, y: 61.15 },
    ],
    [
      { id: '', x: 29.4, y: 32.9 },
      { id: '', x: 29.75, y: 33.25 },
    ],
    [
      { id: '', x: 75.1, y: 27.4 },
      { id: '', x: 75.45, y: 27.75 },
    ],
  ]
  for (const [a, b] of pairs) pts.push(a, b)
  // Isolated outlier, far from every cluster.
  pts.push({ id: '', x: 9, y: 90 })
  return pts.map((p, i) => ({ ...p, id: `p-${i + 1}` }))
}

// The five dates of the lines game, indices into makeSeries(7, 120) —
// the cold-open dataset. 78 is the cold open's marked date; the lines
// phase pays that setup off. Ascending order keeps the reading motion
// natural; same sequence both rounds keeps the comparison fair.
export const LINE_TARGETS = [18, 44, 78, 97, 110] as const

// The five dots of the scatter game, indices into makeScatter(23, 90).
// Chosen (computed once, offline) so each is ≥14.7px from its nearest
// neighbor — far from the planted twins at indices 83–88 — which keeps
// round 2's nearest-point lookup honest: a click landing within ~7px of
// the ringed dot can only resolve to the ringed dot. Order hops between
// clusters so every acquisition is a real pointing movement.
export const SCATTER_TARGETS = [3, 23, 21, 62, 38] as const

// 8 static categories; index 3 is the rudely short bar (≈3px tall once scaled).
export const BAR_DATA: { label: string; value: number }[] = [
  { label: 'A', value: 62 },
  { label: 'B', value: 88 },
  { label: 'C', value: 41 },
  { label: 'D', value: 2 },
  { label: 'E', value: 74 },
  { label: 'F', value: 55 },
  { label: 'G', value: 93 },
  { label: 'H', value: 30 },
]

export type HeatCell = { id: string; col: number; row: number; value: number }

// A smooth-ish seeded field for the counterexample heatmap: two low-
// frequency waves plus a little noise, so it reads as real data while
// every cell stays deterministic.
export function makeHeatmap(seed: number, cols: number, rows: number): HeatCell[] {
  const rand = mulberry32(seed)
  const cells: HeatCell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let v =
        50 +
        28 * Math.sin(c / 2.2 + r / 1.7) +
        16 * Math.sin(r / 1.1 - c / 3.8) +
        (rand() - 0.5) * 22
      v = Math.max(2, Math.min(98, v))
      cells.push({
        id: `${String.fromCharCode(65 + c)}${r + 1}`,
        col: c,
        row: r,
        value: v,
      })
    }
  }
  return cells
}

// Column order for the Fitts rounds — same seed both rounds keeps the
// comparison fair. Never repeats a column back-to-back, so every click
// is a real pointing movement.
export function makeTargetSequence(seed: number, n: number, k: number): number[] {
  const rand = mulberry32(seed)
  const seq: number[] = []
  let prev = -1
  for (let i = 0; i < n; i++) {
    let next = Math.floor(rand() * k)
    while (next === prev) next = (next + 1 + Math.floor(rand() * (k - 1))) % k
    seq.push(next)
    prev = next
  }
  return seq
}
