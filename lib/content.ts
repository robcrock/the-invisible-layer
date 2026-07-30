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
        "That took {time}s, and your pointer sat on the line for just {pct}% of it. The chart’s fine. The target’s the problem.",
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
        "Smaller target, slower click. That’s Fitts’s Law, and the stopwatch just proved it.",
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
        'The Steering Law is what made round 1 miserable. One invisible overlay made round 2 trivial. Same chart from the open, except now it actually answers.',
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
        'Every pixel got an owner, so dead-space misses turned flat-out impossible. That’s why the miss row dropped straight to zero.',
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
  /** Optional mono code aside rendered beneath the body. */
  code?: string
  /** Optional inline link: the first occurrence of `text` in the body becomes an anchor to `href`. */
  link?: { text: string; href: string }
  /** Stage the phase’s pinned demo adopts when this beat activates. */
  demoStage?: string
}

/**
 * One of the three takeaway laws, rendered as a card in the Principles slide’s
 * horizontal triptych (see `principleCards`).
 */
export type PrincipleCard = {
  id: string
  /** The named law, shown as the card eyebrow. */
  law: string
  /** The plain-language statement — the card’s headline. */
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
// the "tell them what you’ll tell them" preview of the named laws.
export const principleCards: PrincipleCard[] = [
  {
    id: 'fitts',
    law: "Fitts’s Law",
    statement: 'Acquisition time grows as targets shrink',
    note: 'The smaller the target, the longer every click takes.',
    chapter: 'Bars',
    illustration: 'fitts',
  },
  {
    id: 'steering',
    law: 'Steering Law',
    statement: 'Difficulty grows with length over width',
    note: 'Trace a long thin path for long enough and you are guaranteed to find a frustrated user.',
    chapter: 'Lines',
    illustration: 'steering',
  },
  {
    id: 'target',
    law: 'Target size',
    statement: 'Small items are fine so long as they are tappable',
    note: 'Regardless of how small a point is, we need to create a space that is its own.',
    chapter: 'Scatter',
    illustration: 'target-size',
  },
]

export const phases: Phase[] = [
  {
    id: 'coverage',
    number: '00',
    title: 'Intro',
    summary: 'The one chart where ink and target are the same shape.',
    demo: 'the-turn-heatmap',
    beats: [
      {
        id: 'coverage-1',
        kicker: 'FULL COVERAGE',
        title: 'A chart that already feels like magic',
        body: 'When the plot is already fully covered, there’s no room for you to miss the mark.',
        demoStage: 'hover',
      },
      {
        id: 'coverage-2',
        kicker: 'WHY IT WORKS',
        title: 'The ink is the tap target',
        body: 'This is one of the rare scenarios where what we want to interact with consumes all possible space uniformly.',
        demoStage: 'coverage',
      },
    ],
  },
  {
    id: 'cold-open',
    number: '01',
    title: 'Perfection',
    summary: 'Strip the ink and the coverage goes with it.',
    demo: 'cold-open-pixel-hunt',
    beats: [
      {
        id: 'cold-open-1',
        kicker: 'CHALLENGE',
        title: 'Point to the point',
        body: 'Hit start and chase its value down a two-pixel stroke while the clock runs.',
        demoStage: 'hunt',
      },
      {
        id: 'cold-open-2',
        title: "The chart isn’t broken",
        body: 'A small value means a small target. The data set those target sizes. Small targets take more time to hit.',
        demoStage: 'honest',
      },
      {
        id: 'cold-open-3',
        kicker: 'THESIS',
        title: "What you draw shouldn’t decide what you can hit",
        body: 'This talk is about designing an invisible layer to reduce user effort.',
        demoStage: 'reveal',
      },
    ],
  },
  {
    id: 'principles',
    number: '02',
    title: 'Principles',
    summary: 'Two laws and a rule, named before you feel them.',
    beats: [
      {
        id: 'principles',
        kicker: 'THE TAKEAWAYS',
        title: 'A few principles that impact the chart feel',
        body: '',
      },
    ],
  },
  {
    id: 'bars',
    number: '03',
    title: 'Fitts Law',
    summary: 'The idea at its simplest: target the category, not the rectangle.',
    demo: 'bars-fitts',
    beats: [
      {
        id: 'bars-1',
        kicker: 'CHALLENGE',
        title: 'The 3-pixel bar',
        body: "Category D scored a 2, so it’s a two-pixel bar. Go ahead, try to hover it. I’ll wait.",
        demoStage: 'mark',
      },
      {
        id: 'bars-2',
        kicker: 'ROUND 1',
        title: 'Click it. Ten times.',
        body: 'This is what your users feel every single day.',
        demoStage: 'game-1',
      },
      {
        id: 'bars-3',
        kicker: 'THE FIX',
        title: 'Invisible bands become targets',
        body: 'The fix is almost dumb: make the whole column clickable, not just the bar. Then the target becomes a bar spanning from floor to ceiling. Hard to miss that one.',
        demoStage: 'band',
      },
      {
        id: 'bars-4',
        kicker: 'ROUND 2',
        title: 'Same ten clicks, now the band',
        body: "Same ten clicks, same timer. The only thing that changed is a shape you can’t even see.",
        demoStage: 'game-2',
      },
      {
        id: 'bars-5',
        kicker: 'MEASURED',
        title: "Fitts’s Law",
        body: 'Smaller target, slower click, every time. Those costs add up.',
        demoStage: 'results',
      },
      {
        id: 'bars-6',
        kicker: 'IN YOUR WORK',
        title: 'Target the category, not the rectangle',
        body: "This works anywhere you’ve got small categorical values: KPI bars, sparkbars, and others. Don’t forget, an invisible target gives no hint that it’s there, so it’s smart to include a hint.",
      },
    ],
  },
  {
    id: 'lines',
    number: '04',
    title: 'Steering Law',
    summary: 'The target stops being drawn and becomes computed.',
    demo: 'lines-trace',
    beats: [
      {
        id: 'lines-1',
        kicker: 'CHALLENGE',
        title: 'Trace the 2px line',
        body: 'The honest line chart is back, same 120 points. No rectangle to hide behind this time. Just a thin path and however steady your hand is. Try to keep the tooltip alive.',
        demoStage: 'trace',
      },
      {
        id: 'lines-2',
        kicker: 'ROUND 1',
        title: 'Five dates. Go!',
        body: 'Click the stroke at each pulsing tick, in order. The Steering Law states: the longer and thinner the path, the harder the work.',
        demoStage: 'game-1',
      },
      {
        id: 'lines-3',
        kicker: 'THE FIX',
        title: 'Make the plot the path',
        body: 'Drop one invisible sheet over the whole plot, and as the mouse moves, snap to the nearest date.',
        code: `const bisect = d3.bisector(d => d.px).center
const i = bisect(points, pointer.x)
const nearest = points[i]`,
        demoStage: 'computed',
      },
      {
        id: 'lines-4',
        kicker: 'ROUND 2',
        title: 'Five dates… again. Go!',
        body: "It’s so much easier to hit the target in one dimension.",
        demoStage: 'game-2',
      },
      {
        id: 'lines-5',
        kicker: 'MEASURED',
        title: 'Let the computer do some of the heavy lifting',
        body: 'Look at the delta! Nailing these tiny targets feels easy now.',
        demoStage: 'results',
      },
      {
        id: 'lines-6',
        kicker: 'IN YOUR WORK',
        title: 'Why your tooltip vanishes',
        body: "You know the tooltip that scoots away the second you reach for it? Here’s why it does that. It’s glued to your cursor instead of the data point, and it won’t let you land on it. Anchor it to the data and let your pointer walk right into it.",
        demoStage: 'craft',
      },
    ],
  },
  {
    id: 'scatter',
    number: '05',
    title: 'Hidden Affordance',
    summary: 'Geometry only an algorithm can produce.',
    demo: 'scatter-voronoi',
    beats: [
      {
        id: 'scatter-1',
        kicker: 'CHALLENGE',
        title: 'Tortured by tiny dots',
        body: 'Ninety points, only three pixels across. Can you hit the highlighted point? Miss by a hair and nothing happens. Nail it and the wrong name could pop up. When two dots are stacked on the same spot, the browser just keeps whichever it drew last.',
        demoStage: 'naive',
      },
      {
        id: 'scatter-2',
        kicker: 'ROUND 1',
        title: 'Find five dots. The clock is ticking.',
        body: 'Every empty click is a miss. Every wrong name is mis-direction. Only about 1.5% of this plot is even alive. No sweat, right?',
        demoStage: 'game-1',
      },
      {
        id: 'scatter-3',
        kicker: 'THE FIX',
        title: 'Every pixel belongs to somebody',
        body: "Here’s the move: hand every pixel in the plot to its nearest point. It’s called a Voronoi tessellation, and it carves the space into territories, one per dot.",
        code: `const delaunay = d3.Delaunay.from(
  points,
  d => d.px,
  d => d.py,
)
const i = delaunay.find(pointer.x, pointer.y)
const nearest = points[i]`,
        demoStage: 'voronoi',
      },
      {
        id: 'scatter-4',
        kicker: 'ROUND 2',
        title: 'Same five dots',
        body: 'Click anywhere near the ring, and the closest dot claims it.',
        demoStage: 'game-2',
      },
      {
        id: 'scatter-5',
        kicker: 'MEASURED',
        title: 'Accuracy improved immediately',
        body: "Researchers named this the bubble cursor back in 2005, and WCAG’s spacing rule for tiny targets attempts to enforce this standard.",
        link: {
          text: 'WCAG’s spacing rule',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum',
        },
        demoStage: 'results',
      },
      {
        id: 'scatter-6',
        kicker: 'TRADEOFF',
        title: 'Clamp the radius',
        body: 'A hover far out in empty space still fires the nearest dot, which feels broken. So swap delaunay.find for a quadtree and cap how far it reaches. Drag the slider; there’s no perfect setting.',
        code: `const qt = d3.quadtree()
  .x(d => d.px)
  .y(d => d.py)
  .addAll(points)

const hit = qt.find(pointer.x, pointer.y, radius)
// past \`radius\`, hit is undefined — a dead zone`,
        demoStage: 'clamp',
      },
    ],
  },
  {
    id: 'close',
    number: '06',
    title: 'Outro',
    summary: 'Honest mark, generous target.',
    beats: [
      {
        id: 'close-reprise',
        kicker: 'THE THREE PRINCIPLES',
        title: 'How we measure our impact',
        body: "Different charts, but it’s the same move every time: draw the honest mark, then hand it the biggest reasonable target you can.",
      },
      {
        id: 'close-1',
        title: 'Add a sense of presence',
        body: "Once the target goes invisible, the feedback has to do the work. That’s how we let the user know what’s actually there.",
      },
      {
        id: 'close-test',
        kicker: 'TAKE IT HOME',
        title: 'Put a clock on your own charts',
        body: "One question finds the gap in anything you ship: how much of this chart responds, and how much of it should? If it already reads 100, the way that heatmap did when we started, then great. Go home. You’re done.",
      },
      {
        id: 'close-2',
        kicker: 'TAKEAWAY',
        title: 'The mark stays bound to the data; the target stays generous to the human',
        body: "That’s the invisible layer.",
      },
    ],
  },
]
