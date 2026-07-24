export type WidgetCopy = {
  hint?: string
  controls?: Record<string, string>
  stages?: Record<string, string>
  results?: Record<string, string>
}

// Every prompt, button label, stage caption, and result template the demo
// widgets render. Components interpolate numbers; they own zero prose.
export const demoCopy = {
  shared: {
    debugLabel: 'HIT TARGETS',
  },
  'cold-open-pixel-hunt': {
    hint: 'Read the value at the marked date.',
    controls: {
      start: 'START THE HUNT',
      retry: 'HUNT AGAIN',
    },
    stages: {
      goal: 'One value. The tick marks date #078 — catch it on the line and hold it.',
      callout: 'target height: 2px',
    },
    results: {
      target: 'target',
      hunting: 'hunting',
      onTarget: 'on the line',
      drops: 'tooltip deaths',
      value: '#078 = {value}',
      framing:
        'That took {time}s, and your pointer was on the line for {pct}% of it. The chart is fine. The target is the problem.',
    },
  },
  'bars-fitts': {
    hint: 'Hover the shortest bar.',
    controls: {
      mark: 'MARK',
      band: 'BAND',
      start1: 'START ROUND 1',
      start2: 'START ROUND 2',
    },
    stages: {
      band: 'the category owns the whole column now',
      round1: 'ROUND 1 · the drawn bar',
      round2: 'ROUND 2 · the invisible band',
      armed1:
        'Ten clicks on the pulsing bar. The drawn rectangle is the target. Timer starts when you do.',
      armed2: 'Same ten clicks — the invisible band carries the target now.',
      capped: 'Called on time. You get the point.',
    },
    results: {
      round1: 'round 1 · bar',
      round2: 'round 2 · band',
      total: 'total',
      perHit: 'avg / click',
      misses: 'misses',
      delta: '≈{delta}ms saved per click',
      framing:
        "Fitts's Law: acquisition time grows as targets shrink. You just measured it.",
      reset: 'RESET',
    },
  },
  'lines-trace': {
    hint: 'Keep the tooltip alive across the line.',
    controls: {
      trace: 'TRACE',
      computed: 'COMPUTED',
      start1: 'START ROUND 1',
      start2: 'START ROUND 2',
    },
    stages: {
      trace: 'the target is the 2px stroke',
      computed: 'the target is computed, not drawn',
      craft: 'anchored to the data — travel into it',
      round1: 'ROUND 1 · click the stroke at each marked date',
      round2: 'ROUND 2 · click anywhere near each date',
      armed1:
        "Five dates, in order. Land a click on the stroke at each pulsing tick. This is the cold open's chart.",
      armed2:
        'Same five dates. One overlay + d3.bisector — click anywhere near the tick.',
      capped: 'Called on time. You get the point.',
    },
    results: {
      round1: 'round 1 · stroke',
      round2: 'round 2 · computed',
      total: 'total',
      perHit: 'avg / date',
      misses: 'missed the line',
      wrongHits: 'wrong date',
      delta: '≈{delta}ms saved per reading',
      framing:
        'The Steering Law made round 1 slow; one overlay rect and d3.bisector made round 2 trivial. Same chart as the cold open — now it answers.',
      reset: 'RESET',
    },
  },
  'scatter-voronoi': {
    hint: 'Find and hover {id}.',
    controls: {
      naive: 'NAIVE',
      nearest: 'NEAREST',
      clamp: 'CLAMP',
      start1: 'START ROUND 1',
      start2: 'START ROUND 2',
    },
    stages: {
      found: 'got it — eventually',
      tease: 'Every other pixel is dead. Next: give every pixel an owner.',
      nearest: 'delaunay.find(x, y) — every pixel belongs to somebody',
      clamp: 'quadtree.find(x, y, r) — dead zones vs mis-triggers. No universal answer.',
      round1: 'ROUND 1 · the dots are the targets',
      round2: 'ROUND 2 · the nearest point owns your click',
      armed1:
        'Five ringed dots, in order. Click each one — the 3px dot is the whole target.',
      armed2:
        'Same five dots. delaunay.find picks the owner — click anywhere near the ring.',
      capped: 'Called on time. You get the point.',
    },
    results: {
      round1: 'round 1 · dots',
      round2: 'round 2 · voronoi',
      total: 'total',
      perHit: 'avg / dot',
      misses: 'dead-space misses',
      wrongHits: 'wrong-point hits',
      delta: '≈{delta}ms saved per dot',
      framing:
        'delaunay.find gave every pixel an owner, so dead-space misses became geometrically impossible. You watched that row hit zero.',
      reset: 'RESET',
      hovering: 'hovering',
      target: 'target',
      livePixels: 'live pixels: ~{pct}% of the plot',
    },
  },
  'the-turn-heatmap': {
    hint: 'Hover anywhere. Everything answers.',
    stages: {
      coverage: 'mark area = target area — the layer has nothing to add',
    },
    results: {
      hovering: 'hovering',
      livePixels: 'live pixels: 100% of the plot',
    },
  },
} as const satisfies { shared: { debugLabel: string } } & Record<
  string,
  WidgetCopy | { debugLabel: string }
>

export type Beat = {
  id: string
  kicker?: string
  title: string
  body: string
  /** Stage the phase's pinned demo adopts when this beat activates. */
  demoStage?: string
}

export type Phase = {
  id: string
  number: string
  title: string
  summary: string
  /** demoRegistry key — presence selects the pinned two-column layout. */
  demo?: string
  beats: Beat[]
}

export const phases: Phase[] = [
  {
    id: 'cold-open',
    number: '00',
    title: 'Preamble',
    summary: "The honest chart's misery.",
    demo: 'cold-open-pixel-hunt',
    beats: [
      {
        id: 'cold-open-1',
        kicker: 'CHALLENGE',
        title: 'Try to read one value',
        body: 'A dense line chart, 120 points, one marked date. Press start and read the value at the tick — the timer runs until you catch it. Everyone in the room has felt this.',
        demoStage: 'hunt',
      },
      {
        id: 'cold-open-2',
        title: "The chart isn't broken — it's honest",
        body: 'A small value is a short bar. A trend is a 2px line. The data decided your target sizes — and the clock you just watched is what that decision costs.',
        demoStage: 'honest',
      },
      {
        id: 'cold-open-3',
        kicker: 'THESIS',
        title: 'The mark you see is not the target you touch',
        body: 'Data integrity wants honest marks. Usability wants generous targets. The invisible layer is how a chart gets both — and by the lines phase, this exact chart gets fixed.',
        demoStage: 'reveal',
      },
    ],
  },
  {
    id: 'bars',
    number: '01',
    title: 'Bars',
    summary: 'The idea at its simplest: target the category, not the rectangle.',
    demo: 'bars-fitts',
    beats: [
      {
        id: 'bars-1',
        kicker: 'CHALLENGE',
        title: 'The 3-pixel bar',
        body: 'Category D earned a value of 2, so it drew two pixels tall. Hover it. The mark is honest; the target is a joke.',
        demoStage: 'mark',
      },
      {
        id: 'bars-2',
        kicker: 'ROUND 1',
        title: 'Click it. Ten times. Timed.',
        body: 'Now every bar is rudely short, and the timer runs until you land ten clicks on the drawn rectangles. Press start — this is what your users feel.',
        demoStage: 'game-1',
      },
      {
        id: 'bars-3',
        kicker: 'THE FIX',
        title: 'Invisible band targets',
        body: "Transparent rects spanning the full column height and the full scaleBand step — ten lines of JSX. One gotcha: fill='none' swallows pointer events, so it's fill='transparent' or pointer-events='all'. The highlight shows where your targets just grew to.",
        demoStage: 'band',
      },
      {
        id: 'bars-4',
        kicker: 'ROUND 2',
        title: 'Same ten clicks — the band',
        body: 'Identical target sequence, identical timer. The only thing that changed is geometry you cannot see.',
        demoStage: 'game-2',
      },
      {
        id: 'bars-5',
        kicker: 'MEASURED',
        title: "Fitts's Law, measured",
        body: "Acquisition time grows as targets shrink — that's Fitts's Law, and you just generated the evidence. The delta is per click. Multiply it by every hover your dashboard gets in a week.",
        demoStage: 'results',
      },
      {
        id: 'bars-6',
        kicker: 'IN YOUR WORK',
        title: 'Target the category, not the rectangle',
        body: 'Any categorical chart with small values qualifies: KPI bars, grouped comparisons, sparkbars in tables. And because invisible targets have no affordance, the response must be instant and unmistakable; feedback carries the other half of the layer.',
      },
    ],
  },
  {
    id: 'lines',
    number: '02',
    title: 'Lines',
    summary: 'The target stops being drawn and becomes computed.',
    demo: 'lines-trace',
    beats: [
      {
        id: 'lines-1',
        kicker: 'CHALLENGE',
        title: 'Trace the 2px line',
        body: "The cold open's chart is back — same 120 points. There's no rectangle to draw this time, just a thin path and a steady hand. Keep the tooltip alive.",
        demoStage: 'trace',
      },
      {
        id: 'lines-2',
        kicker: 'ROUND 1',
        title: 'Five dates. On the stroke.',
        body: 'Click the stroke at each pulsing tick, in order. The Steering Law says difficulty grows with length over width — a 2px path is about as hard as pointing tasks get. Feel it.',
        demoStage: 'game-1',
      },
      {
        id: 'lines-3',
        kicker: 'THE FIX',
        title: 'One overlay, bisector math',
        body: "A single rect over the whole plot; onPointerMove + d3.bisector snaps to the nearest x. The target is no longer something you draw — it's something you compute. The highlight is the new truth: every pixel in the plot belongs to a date.",
        demoStage: 'computed',
      },
      {
        id: 'lines-4',
        kicker: 'ROUND 2',
        title: 'Same five dates',
        body: 'Click anywhere near each tick — the bisector finds the date for you. Notice that you stopped aiming.',
        demoStage: 'game-2',
      },
      {
        id: 'lines-5',
        kicker: 'MEASURED',
        title: 'The target became computed',
        body: 'Read the delta. Missing the line is now geometrically impossible, and #078, the date that opened this talk, took a fraction of the time.',
        demoStage: 'results',
      },
      {
        id: 'lines-6',
        kicker: 'IN YOUR WORK',
        title: 'Why your tooltip vanishes',
        body: "It's parented to the cursor instead of the snapped point, and it isn't hoverable. Anchor it to the data, let the pointer travel into it. This is the hover pattern of every serious charting library — and now you know the five lines that make it.",
        demoStage: 'craft',
      },
    ],
  },
  {
    id: 'scatter',
    number: '03',
    title: 'Scatter',
    summary: 'Geometry only an algorithm can produce.',
    demo: 'scatter-voronoi',
    beats: [
      {
        id: 'scatter-1',
        kicker: 'CHALLENGE',
        title: 'Tiny dots, two failure modes',
        body: 'Ninety points, three-pixel dots. Find and hover the ringed one. Miss and nothing happens; worse, land dead-on and a different name pops up — two points overlap, and DOM order decides who wins.',
        demoStage: 'naive',
      },
      {
        id: 'scatter-2',
        kicker: 'ROUND 1',
        title: 'Find five dots. Timed.',
        body: "Five ringed dots, in order, against the clock. Every empty click is a dead-space miss; every wrong name is a mis-trigger. About 1.5% of this plot is alive — you're aiming at confetti.",
        demoStage: 'game-1',
      },
      {
        id: 'scatter-3',
        kicker: 'THE FIX',
        title: 'Every pixel belongs to somebody',
        body: 'd3.Delaunay.from(points), delaunay.find(x, y). Five lines. The overlay is the proof: a Voronoi tessellation hands every pixel to exactly one point. This is geometry you could never draw by hand.',
        demoStage: 'voronoi',
      },
      {
        id: 'scatter-4',
        kicker: 'ROUND 2',
        title: 'Same five dots',
        body: 'Click anywhere near the ring — the nearest point owns your click. Watch the miss counter do nothing at all.',
        demoStage: 'game-2',
      },
      {
        id: 'scatter-5',
        kicker: 'MEASURED',
        title: 'Misses: impossible',
        body: "The delta is nice; the zero is the headline. Researchers proved this in 2005 as the bubble cursor, and WCAG's target-size spacing exception is, if you squint, the same geometric argument.",
        demoStage: 'results',
      },
      {
        id: 'scatter-6',
        kicker: 'TRADEOFF',
        title: 'Clamp the radius',
        body: '100% coverage means a hover 400px from any point still triggers one — and it feels wrong. quadtree.find(x, y, radius) reintroduces dead zones on purpose. Drag the radius and feel it: dead zones vs mis-triggers is a real design decision with no universal answer.',
        demoStage: 'clamp',
      },
    ],
  },
  {
    id: 'the-turn',
    number: '04',
    title: 'The counter argument',
    summary: 'The chart that needs nothing.',
    demo: 'the-turn-heatmap',
    beats: [
      {
        id: 'the-turn-1',
        kicker: 'COUNTEREXAMPLE',
        title: 'The heatmap counterexample',
        body: 'Marks already fill the space; hover anywhere and something answers. The invisible layer exists to close the gap between mark area and target area, and when the gap is zero, it disappears.',
        demoStage: 'hover',
      },
      {
        id: 'the-turn-2',
        kicker: 'IN YOUR WORK',
        title: 'The test you take home',
        body: "How much of my chart responds — versus how much should? Toggle the targets here and nothing new appears: this chart scores 100%. Try the same test on a thin pie slice, a thin stacked-area layer, a sparkline. You can answer now — and you know how to put a clock on the difference.",
        demoStage: 'coverage',
      },
    ],
  },
  {
    id: 'close',
    number: '05',
    title: 'Close',
    summary: 'Honest mark, generous target.',
    beats: [
      {
        id: 'close-1',
        title: 'Invisible target, unmissable feedback',
        body: 'You hid the layer, so the response has to carry the whole conversation: the instant highlight, the anchored tooltip, the flash on every hit you just made. Feedback is what makes an invisible target trustable.',
      },
      {
        id: 'close-2',
        kicker: 'TAKEAWAY',
        title: 'The mark stays honest to the data; the target stays generous to the human',
        body: "That's the invisible layer.",
      },
    ],
  },
]
