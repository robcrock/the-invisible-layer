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
    stages: {
      callout: 'target height: 2px',
    },
    results: {
      hunting: 'hunting',
      onTarget: 'on the line',
    },
  },
  'bars-before-after': {
    hint: 'Hover the shortest bar.',
    controls: {
      mark: 'MARK',
      band: 'BAND',
    },
  },
  'fitts-timer': {
    hint: 'Click the highlighted target 10 times. Timer runs.',
    controls: {
      start: 'START ROUND 1',
      continue: 'START ROUND 2',
      reset: 'RESET',
    },
    stages: {
      round1: 'ROUND 1 · the drawn bar',
      round2: 'ROUND 2 · the invisible band',
      interstitial: 'Round 2: same ten clicks — band targets.',
      capped: 'Called on time. You get the point.',
    },
    results: {
      round1: 'round 1 · bar',
      round2: 'round 2 · band',
      total: 'total',
      perClick: 'avg / click',
      misses: 'misses',
      delta: '≈{delta}ms saved per click',
      framing:
        "Fitts's Law: acquisition time grows as targets shrink. You just measured it.",
    },
  },
  'line-before-after': {
    hint: 'Keep the tooltip alive across the line.',
    controls: {
      trace: 'TRACE',
      computed: 'COMPUTED',
    },
    stages: {
      trace: 'the target is the 2px stroke',
      computed: 'the target is computed, not drawn',
    },
  },
  'scatter-before-after': {
    hint: 'Find and hover {id}.',
    stages: {
      found: 'got it — eventually',
      tease: 'Every other pixel is dead. Next: give every pixel an owner.',
    },
    results: {
      hovering: 'hovering',
      target: 'target',
      misses: 'dead-space misses',
      wrongHits: 'wrong-point hits',
      livePixels: 'live pixels: ~{pct}% of the plot',
    },
  },
  'voronoi-reveal': {
    hint: 'Hover anywhere.',
    controls: {
      naive: 'NAIVE',
      nearest: 'NEAREST',
      clamp: 'CLAMP',
    },
    stages: {
      naive: 'per-dot hitboxes — you remember this',
      nearest: 'delaunay.find(x, y) — every pixel belongs to somebody',
      clamp: 'quadtree.find(x, y, r) — dead zones vs mis-triggers. No universal answer.',
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
  demoSlot?: string
}

export type Phase = {
  id: string
  number: string
  title: string
  summary: string
  beats: Beat[]
}

export const phases: Phase[] = [
  {
    id: 'cold-open',
    number: '00',
    title: 'Cold open',
    summary: "The honest chart's misery.",
    beats: [
      {
        id: 'cold-open-1',
        kicker: 'LIVE DEMO',
        title: 'Try to read one value',
        body: 'A dense, real-world line chart. Hover it. Hunt the pixel. Everyone in the room has felt this.',
        demoSlot: 'cold-open-pixel-hunt',
      },
      {
        id: 'cold-open-2',
        title: "The chart isn't broken — it's honest",
        body: 'A small value is a short bar. A trend is a 2px line. The data decided your target sizes, and the data was rude about it.',
      },
      {
        id: 'cold-open-3',
        kicker: 'THESIS',
        title: 'The mark you see is not the target you touch',
        body: 'Data integrity wants honest marks. Usability wants generous targets. The invisible layer is how a chart gets both.',
      },
    ],
  },
  {
    id: 'bars',
    number: '01',
    title: 'Bars',
    summary: 'The idea at its simplest: target the category, not the rectangle.',
    beats: [
      {
        id: 'bars-1',
        kicker: 'DEMO',
        title: 'The 3-pixel bar',
        body: 'One rudely short bar. Hover misery, quick and visceral.',
        demoSlot: 'bars-before-after',
      },
      {
        id: 'bars-2',
        title: 'Invisible band targets',
        body: 'Transparent rects spanning the full column height and the full scaleBand step. Ten lines of JSX — the cheapest usability win in dataviz.',
      },
      {
        id: 'bars-3',
        kicker: 'GOTCHA',
        title: 'fill: none swallows pointer events',
        body: "Your invisible rect needs fill='transparent' or pointer-events='all'. The literal mechanics of making the invisible layer receive input.",
      },
      {
        id: 'bars-4',
        kicker: 'MEASURED',
        title: "Fitts's Law, live",
        body: 'Click the 3px bar ten times, then the band ten times, timer running. You just saved half a second per hover — interactions can be quantified.',
        demoSlot: 'fitts-timer',
      },
      {
        id: 'bars-5',
        title: 'Invisible targets have no affordance',
        body: 'So the response must be instant and unmistakable. Feedback is the other half of the layer — hold that thought.',
      },
    ],
  },
  {
    id: 'lines',
    number: '02',
    title: 'Lines',
    summary: 'The target stops being drawn and becomes computed.',
    beats: [
      {
        id: 'lines-1',
        kicker: 'DEMO',
        title: 'Trace the 2px line',
        body: "There's no rectangle to draw this time. Just a thin path and a steady hand.",
        demoSlot: 'line-before-after',
      },
      {
        id: 'lines-2',
        kicker: 'ASIDE',
        title: 'The Steering Law',
        body: 'Difficulty along a path grows linearly with length over width. Tracing a thin line is one of the hardest pointing tasks HCI knows about.',
      },
      {
        id: 'lines-3',
        kicker: 'THE PIVOT',
        title: 'One overlay, bisector math',
        body: "A single rect over the whole plot; onPointerMove + d3.bisector snaps to the nearest x. The target is no longer something you draw — it's something you compute.",
      },
      {
        id: 'lines-4',
        kicker: 'CRAFT',
        title: 'Why your tooltip vanishes',
        body: "It's parented to the cursor instead of the snapped point, and it isn't hoverable. Anchor it to the data, let the pointer travel into it.",
      },
    ],
  },
  {
    id: 'scatter',
    number: '03',
    title: 'Scatter',
    summary: 'Geometry only an algorithm can produce.',
    beats: [
      {
        id: 'scatter-1',
        kicker: 'DEMO',
        title: 'Tiny dots, two failure modes',
        body: 'Misses — and worse, wrong-point hits.',
        demoSlot: 'scatter-before-after',
      },
      {
        id: 'scatter-2',
        kicker: 'THE REVEAL',
        title: 'Every pixel belongs to somebody',
        body: 'Toggle the Voronoi overlay. d3.Delaunay.from(points), delaunay.find(x, y) — five lines.',
        demoSlot: 'voronoi-reveal',
      },
      {
        id: 'scatter-3',
        kicker: 'ASIDE',
        title: 'The spec and the algorithm converged',
        body: "Researchers proved this technique in 2005 (the bubble cursor). And WCAG's target-size spacing exception is, squint at it, the same geometric argument.",
      },
      {
        id: 'scatter-4',
        kicker: 'TRADEOFF',
        title: 'Clamp the radius',
        body: '100% coverage means a hover 400px from any point still triggers one — and it feels wrong. quadtree.find(x, y, radius). Dead zones vs mis-triggers: a real design decision with no universal answer.',
      },
    ],
  },
  {
    id: 'the-turn',
    number: '04',
    title: 'The turn',
    summary: 'The chart that needs nothing.',
    beats: [
      {
        id: 'the-turn-1',
        title: 'The heatmap counterexample',
        body: 'Marks already fill the space. The invisible layer exists to close the gap between mark area and target area — when the gap is zero, it disappears.',
      },
      {
        id: 'the-turn-2',
        title: 'The test you take home',
        body: 'How much of my chart responds — versus how much should? Try it on a thin pie slice. A thin stacked-area layer. You can answer now.',
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
        body: 'You hid the layer, so the response has to carry the whole conversation.',
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
