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
      goal: 'One value. The tick marks date #078. Catch it on the line and hold it.',
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
        'Ten clicks on the pulsing bar; the drawn rectangle is the target. Timer starts when you do.',
      armed2: 'Same ten clicks. The invisible band carries the target now.',
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
      craft: 'anchored to the data, travel into it',
      round1: 'ROUND 1 · click the stroke at each marked date',
      round2: 'ROUND 2 · click anywhere near each date',
      armed1:
        'Five dates, in order. Land a click on the stroke at each pulsing tick. This is the honest chart from the open.',
      armed2:
        'Same five dates. One overlay and d3.bisector, so click anywhere near the tick.',
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
        'The Steering Law made round 1 slow; one overlay rect and d3.bisector made round 2 trivial. Same chart as the open, and now it answers.',
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
      found: 'got it, eventually',
      tease: 'Every other pixel is dead. Next: give every pixel an owner.',
      nearest: 'delaunay.find(x, y): every pixel belongs to somebody',
      clamp: 'quadtree.find(x, y, r): dead zones vs mis-triggers, no universal answer.',
      round1: 'ROUND 1 · the dots are the targets',
      round2: 'ROUND 2 · the nearest point owns your click',
      armed1:
        'Five ringed dots, in order. Click each one; the 3px dot is the whole target.',
      armed2:
        'Same five dots. delaunay.find picks the owner, so click anywhere near the ring.',
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
      coverage: 'ink coverage = target coverage = 100%',
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

/**
 * One of the three takeaway laws, rendered as a card in the Principles slide's
 * horizontal triptych (see `principleCards`).
 */
export type PrincipleCard = {
  id: string
  /** The named law, shown as the card eyebrow. */
  law: string
  /** The plain-language statement — the card's headline. */
  statement: string
  note: string
  /** The demo chapter where the audience will measure this law. */
  chapter: string
  /** principleIllustration key — the diagram at the top of the card. */
  illustration: string
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

// The Principles slide renders these three as a horizontal card triptych —
// the "tell them what you'll tell them" preview of the named laws.
export const principleCards: PrincipleCard[] = [
  {
    id: 'fitts',
    law: "Fitts's Law",
    statement: 'Acquisition time grows as targets shrink',
    note: 'The smaller the target, the longer every click takes, and an honest chart is full of them.',
    chapter: 'Bars',
    illustration: 'fitts',
  },
  {
    id: 'steering',
    law: 'Steering Law',
    statement: 'Difficulty grows with length over width',
    note: 'Tracing a long, thin path is the hardest pointing task there is. A 2px line is about as thin as it gets.',
    chapter: 'Lines',
    illustration: 'steering',
  },
  {
    id: 'target',
    law: 'Target size',
    statement: 'Small is fine if the space around it is yours',
    note: "WCAG's spacing exception lets a small mark pass when the clear space around it belongs to it.",
    chapter: 'Scatter',
    illustration: 'target-size',
  },
]

export const phases: Phase[] = [
  {
    id: 'coverage',
    number: '00',
    title: 'Coverage',
    summary: 'The one chart where ink and target are the same shape.',
    demo: 'the-turn-heatmap',
    beats: [
      {
        id: 'coverage-1',
        kicker: 'FULL COVERAGE',
        title: 'A chart that already works',
        body: 'Hover anywhere on this heatmap and it answers. No aiming, nowhere to miss. The readout says it plainly: live pixels, 100% of the plot.',
        demoStage: 'hover',
      },
      {
        id: 'coverage-2',
        kicker: 'WHY IT WORKS',
        title: 'Here, the ink is the target',
        body: "Every cell is a mark, and every mark fills its square, so what you can see is exactly what you can hit. That's why it feels effortless: ink coverage and interaction coverage both sit at 100. Almost no other chart gets that for free. Tell the truth about a small number and you draw a three-pixel bar or a two-pixel line, and that sliver is all there is to hit.",
        demoStage: 'coverage',
      },
    ],
  },
  {
    id: 'cold-open',
    number: '01',
    title: 'The honest chart',
    summary: 'Strip the ink and the coverage goes with it.',
    demo: 'cold-open-pixel-hunt',
    beats: [
      {
        id: 'cold-open-1',
        kicker: 'CHALLENGE',
        title: 'Now read one value',
        body: "Here's that same honesty on a line instead of a grid. A hundred and twenty points and one marked date. Press start, then chase its value down the 2-pixel stroke while the clock runs.",
        demoStage: 'hunt',
      },
      {
        id: 'cold-open-2',
        title: "The chart isn't broken. It's honest.",
        body: "A small value is a short bar. A trend is a thin line. The data set these target sizes, not a careless designer, and the clock you just watched is the bill for that honesty. Coverage here is about one and a half percent, down from the heatmap's hundred.",
        demoStage: 'honest',
      },
      {
        id: 'cold-open-3',
        kicker: 'THESIS',
        title: "What you draw shouldn't decide what you can hit",
        body: "One rule nobody wrote down is doing all the damage: your targets have to match your ink. Break it. Keep the marks honest and sparse, and push coverage back to 100 with targets you never draw. That's the invisible layer, and by the lines chapter we do it to this exact chart.",
        demoStage: 'reveal',
      },
    ],
  },
  {
    id: 'principles',
    number: '02',
    title: 'The Principles',
    summary: 'Two laws and a rule, named before you feel them.',
    beats: [
      {
        id: 'principles',
        kicker: 'THE TAKEAWAYS',
        title: 'Three principles decide how a chart feels',
        body: "Two laws of pointing and one rule about target size set how hard a chart is to use. You'll measure all three yourself. Here they are, up front.",
      },
    ],
  },
  {
    id: 'bars',
    number: '03',
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
        body: 'Now every bar is short. Land ten clicks on the drawn rectangles; the timer runs until you do. This is what your users feel.',
        demoStage: 'game-1',
      },
      {
        id: 'bars-3',
        kicker: 'THE FIX',
        title: 'Invisible band targets',
        body: "Transparent rects spanning the full column height and scaleBand step. Ten lines of JSX. One gotcha: fill='none' swallows pointer events, so use fill='transparent' or pointer-events='all'. The highlight shows where your targets grew to.",
        demoStage: 'band',
      },
      {
        id: 'bars-4',
        kicker: 'ROUND 2',
        title: 'Same ten clicks, now the band',
        body: "Same sequence, same timer. The only thing that changed is geometry you can't see.",
        demoStage: 'game-2',
      },
      {
        id: 'bars-5',
        kicker: 'MEASURED',
        title: "Fitts's Law, measured",
        body: "Acquisition time grows as targets shrink. That's Fitts's Law, and you just measured it. The delta is per click. Multiply it by every hover your dashboard gets in a week.",
        demoStage: 'results',
      },
      {
        id: 'bars-6',
        kicker: 'IN YOUR WORK',
        title: 'Target the category, not the rectangle',
        body: 'Any categorical chart with small values qualifies: KPI bars, sparkbars in a table. And an invisible target has no affordance, so the response has to be instant and unmistakable. Feedback carries the other half of the layer.',
      },
    ],
  },
  {
    id: 'lines',
    number: '04',
    title: 'Lines',
    summary: 'The target stops being drawn and becomes computed.',
    demo: 'lines-trace',
    beats: [
      {
        id: 'lines-1',
        kicker: 'CHALLENGE',
        title: 'Trace the 2px line',
        body: 'That honest line chart is back, same 120 points. No rectangle to draw this time, just a thin path and a steady hand. Keep the tooltip alive.',
        demoStage: 'trace',
      },
      {
        id: 'lines-2',
        kicker: 'ROUND 1',
        title: 'Five dates. On the stroke.',
        body: 'Click the stroke at each pulsing tick, in order. The Steering Law: difficulty grows with length over width, and a 2px path is about as hard as pointing gets.',
        demoStage: 'game-1',
      },
      {
        id: 'lines-3',
        kicker: 'THE FIX',
        title: 'One overlay, bisector math',
        body: "One rect over the whole plot; onPointerMove + d3.bisector snaps to the nearest x. The target is no longer drawn. It's computed. Every pixel in the plot now belongs to a date.",
        demoStage: 'computed',
      },
      {
        id: 'lines-4',
        kicker: 'ROUND 2',
        title: 'Same five dates',
        body: 'Click anywhere near each tick; the bisector finds the date. You stopped aiming.',
        demoStage: 'game-2',
      },
      {
        id: 'lines-5',
        kicker: 'MEASURED',
        title: 'The target became computed',
        body: 'Read the delta. Missing the line is now impossible, and #078, the date that opened this talk, took a fraction of the time.',
        demoStage: 'results',
      },
      {
        id: 'lines-6',
        kicker: 'IN YOUR WORK',
        title: 'Why your tooltip vanishes',
        body: "It's parented to the cursor instead of the snapped point, and it isn't hoverable. Anchor it to the data; let the pointer travel into it. That's the hover pattern behind every serious charting library. Five lines.",
        demoStage: 'craft',
      },
    ],
  },
  {
    id: 'scatter',
    number: '05',
    title: 'Scatter',
    summary: 'Geometry only an algorithm can produce.',
    demo: 'scatter-voronoi',
    beats: [
      {
        id: 'scatter-1',
        kicker: 'CHALLENGE',
        title: 'Tiny dots, two failure modes',
        body: 'Ninety points, three-pixel dots. Find the ringed one and hover it. Miss, and nothing happens; land dead-on, and the wrong name might pop up, because two points overlap and DOM order picks the winner.',
        demoStage: 'naive',
      },
      {
        id: 'scatter-2',
        kicker: 'ROUND 1',
        title: 'Find five dots. Timed.',
        body: "Five ringed dots, in order, against the clock. Every empty click is a dead-space miss; every wrong name, a mis-trigger. About 1.5% of this plot is alive, so you're aiming at confetti.",
        demoStage: 'game-1',
      },
      {
        id: 'scatter-3',
        kicker: 'THE FIX',
        title: 'Every pixel belongs to somebody',
        body: 'd3.Delaunay.from(points), delaunay.find(x, y). Five lines. A Voronoi tessellation hands every pixel to exactly one point, geometry you could never draw by hand.',
        demoStage: 'voronoi',
      },
      {
        id: 'scatter-4',
        kicker: 'ROUND 2',
        title: 'Same five dots',
        body: 'Click anywhere near the ring; the nearest point owns your click. The miss counter never moves.',
        demoStage: 'game-2',
      },
      {
        id: 'scatter-5',
        kicker: 'MEASURED',
        title: 'Misses: impossible',
        body: "The delta is nice; the zero is the headline. Researchers named this the bubble cursor in 2005, and WCAG's target-size spacing exception is the same geometric argument.",
        demoStage: 'results',
      },
      {
        id: 'scatter-6',
        kicker: 'TRADEOFF',
        title: 'Clamp the radius',
        body: '100% coverage means a hover 400px from any point still triggers one, and that feels wrong. quadtree.find(x, y, radius) puts dead zones back on purpose. Drag it: dead zones vs mis-triggers is a real decision with no universal answer.',
        demoStage: 'clamp',
      },
    ],
  },
  {
    id: 'close',
    number: '06',
    title: 'Close',
    summary: 'Honest mark, generous target.',
    beats: [
      {
        id: 'close-reprise',
        kicker: 'THE THREE PRINCIPLES',
        title: 'What you just measured',
        body: 'Fitts: small targets cost time. Steering: thin paths cost more. Target size: a 3px dot passes when the space around it is its own. Three ideas, one move: an honest mark with a generous target.',
      },
      {
        id: 'close-1',
        title: 'Invisible target, unmissable feedback',
        body: 'You hid the layer, so the response carries the whole conversation: the instant highlight, the anchored tooltip, the flash on every hit. Feedback is what makes an invisible target trustable.',
      },
      {
        id: 'close-test',
        kicker: 'TAKE IT HOME',
        title: 'Put a clock on your own charts',
        body: "One question finds the gap in anything you build: how much of this chart responds, and how much should? Toggle the targets and count the live pixels. A thin pie slice or a stacked-area layer usually reads low, and that's a gap worth closing. If it already reads 100, the way the heatmap did when we started, walk away. You're done.",
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
