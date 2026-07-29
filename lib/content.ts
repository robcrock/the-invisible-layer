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
    note: 'The smaller the target, the longer every click takes, and an honest chart is packed with tiny ones.',
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
    note: "A small mark still passes, as long as the clear space around it is its own. That’s WCAG’s spacing exception.",
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
        body: 'Hover anywhere on this heatmap and it answers. Nothing to aim at, nowhere to miss. Watch the readout: live pixels, 100% of the plot. Hold onto that number, because we spend the rest of the talk trying to win it back.',
        demoStage: 'hover',
      },
      {
        id: 'coverage-2',
        kicker: 'WHY IT WORKS',
        title: 'Here, the ink is the target',
        body: "Every cell is a mark, and every mark fills its whole square, so what you see is exactly what you can hit. That’s the entire reason it feels effortless: ink and interaction both sit at 100%. Almost nothing else gets that for free. Tell the truth about a small number and you get a three-pixel bar or a two-pixel line, and good luck landing on that.",
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
        body: "Same honesty, now on a line instead of a grid. A hundred and twenty points, one marked date. Hit start and chase its value down a two-pixel stroke while the clock runs. Sounds easy. It really isn’t.",
        demoStage: 'hunt',
      },
      {
        id: 'cold-open-2',
        title: "The chart isn’t broken",
        body: "A small value is a short bar. A trend is a thin line. Nobody was careless here; the data itself set those target sizes, and that clock was the bill for telling the truth. Coverage just cratered to about one and a half percent, down from a hundred.",
        demoStage: 'honest',
      },
      {
        id: 'cold-open-3',
        kicker: 'THESIS',
        title: "What you draw shouldn’t decide what you can hit",
        body: "One unwritten rule is doing all the damage: your targets have to match your ink. So let’s break it. Keep the marks honest and sparse, then shove coverage back to 100% with targets nobody ever sees. That’s the invisible layer, and by the time we reach the lines, we run it on this exact chart.",
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
        body: "Two laws of pointing and one rule about size decide how hard a chart is to use. We measure all three before we’re done. Here they are up front, so you know what to watch for.",
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
        body: "Category D scored a 2, so it’s a two-pixel bar. Go ahead, try to hover it. I’ll wait. Nothing’s wrong with the bar. An honest 2 just is that small, which makes it a miserable thing to ask a human to click.",
        demoStage: 'mark',
      },
      {
        id: 'bars-2',
        kicker: 'ROUND 1',
        title: 'Click it. Ten times. Timed.',
        body: 'Now every bar is short. Ten clicks, all on the drawn rectangles, and the timer keeps running until you land them. This right here is what your users feel every single day.',
        demoStage: 'game-1',
      },
      {
        id: 'bars-3',
        kicker: 'THE FIX',
        title: 'Invisible band targets',
        body: "The fix is almost dumb: make the whole column clickable, not just the bar. One invisible target, floor to ceiling, sitting right where people already point. There’s a fun trap here, though. Empty space and invisible space look identical to a mouse, so you have to tell that blank column to actually listen. The orange shows where your target just grew to.",
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
        title: "Fitts’s Law, measured",
        body: "Smaller target, slower click, every single time. That’s Fitts’s Law, and we just put it on a stopwatch. That number? It’s the cost of one click. Now picture every hover your dashboard serves up in a week.",
        demoStage: 'results',
      },
      {
        id: 'bars-6',
        kicker: 'IN YOUR WORK',
        title: 'Target the category, not the rectangle',
        body: "This works anywhere you’ve got small categorical values: KPI bars, the sparkbars buried in a table. One catch. An invisible target gives no hint that it’s there, so the response has to fire instantly and obviously. Feedback carries the other half of the load.",
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
        body: 'The honest line chart is back, same 120 points. No rectangle to hide behind this time. Just a thin path and however steady your hand is. Try to keep the tooltip alive.',
        demoStage: 'trace',
      },
      {
        id: 'lines-2',
        kicker: 'ROUND 1',
        title: 'Five dates. On the stroke.',
        body: 'Click the stroke at each pulsing tick, in order. This is the Steering Law in the wild: the longer and thinner the path, the harder the chase. And two pixels is about as thin as thin gets.',
        demoStage: 'game-1',
      },
      {
        id: 'lines-3',
        kicker: 'THE FIX',
        title: 'One overlay, bisector math',
        body: "Drop one invisible sheet over the whole plot, and as the mouse moves, snap to the nearest date. The target isn’t drawn anymore. It’s computed on the fly. Every pixel in the chart now belongs to a date.",
        demoStage: 'computed',
      },
      {
        id: 'lines-4',
        kicker: 'ROUND 2',
        title: 'Same five dates',
        body: 'Now click anywhere near each tick, and the chart figures out which date you meant. You just stopped aiming altogether.',
        demoStage: 'game-2',
      },
      {
        id: 'lines-5',
        kicker: 'MEASURED',
        title: 'The target became computed',
        body: 'Look at the delta. Missing the line is flat-out impossible now, and #078, the value we couldn’t read back at the start, gives itself up in a fraction of the time.',
        demoStage: 'results',
      },
      {
        id: 'lines-6',
        kicker: 'IN YOUR WORK',
        title: 'Why your tooltip vanishes',
        body: "You know the tooltip that scoots away the second you reach for it? Here’s why it does that. It’s glued to your cursor instead of the data point, and it won’t let you land on it. Anchor it to the data and let your pointer walk right into it. That’s the trick behind every serious charting library.",
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
        body: 'Ninety points, three-pixel dots. Find the one wearing a ring and hover it. Miss by a hair and nothing happens. Nail it and the wrong name might pop up anyway, because two dots are stacked on the same spot and the browser just keeps whichever it drew last.',
        demoStage: 'naive',
      },
      {
        id: 'scatter-2',
        kicker: 'ROUND 1',
        title: 'Find five dots. Timed.',
        body: "Five ringed dots, in order, clock running. Every empty click is a miss. Every wrong name is a mis-fire. Only about 1.5% of this plot is even alive, so really, you’re aiming at confetti.",
        demoStage: 'game-1',
      },
      {
        id: 'scatter-3',
        kicker: 'THE FIX',
        title: 'Every pixel belongs to somebody',
        body: "Here’s the move: hand every pixel in the plot to its nearest point. It’s called a Voronoi tessellation, and it carves the space into territories, one per dot. It’s geometry you could never draw by hand, and the computer works it out in a couple of lines.",
        demoStage: 'voronoi',
      },
      {
        id: 'scatter-4',
        kicker: 'ROUND 2',
        title: 'Same five dots',
        body: 'Click anywhere near the ring, and the closest dot claims it. Keep an eye on the miss counter. It never budges.',
        demoStage: 'game-2',
      },
      {
        id: 'scatter-5',
        kicker: 'MEASURED',
        title: 'Misses: impossible',
        body: "The delta’s nice, but the zero is the real headline: misses just became impossible. Researchers named this the bubble cursor back in 2005, and WCAG’s spacing rule for tiny targets is making the very same argument.",
        demoStage: 'results',
      },
      {
        id: 'scatter-6',
        kicker: 'TRADEOFF',
        title: 'Clamp the radius',
        body: 'There’s a catch to 100% coverage: a hover way out in empty space, 400 pixels from anything, still fires the nearest dot. That feels broken. So you put some dead space back on purpose and cap how far a point can reach. Drag the slider. Dead zones versus false hits is a real tradeoff, and no single setting is right for everyone.',
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
        body: "So, three things worth stealing. Small targets are slow. Thin lines are worse. And a three-pixel dot is totally fine, as long as it owns the space around it. Different charts, but it’s the same move every time: draw the honest mark, then hand it a target bigger than it looks.",
      },
      {
        id: 'close-1',
        title: 'Invisible target, unmissable feedback',
        body: "Once the target goes invisible, the feedback has to do all the talking. The instant highlight, the tooltip that finally holds still, the little flash on every hit. That’s what makes something you can’t even see feel trustworthy.",
      },
      {
        id: 'close-test',
        kicker: 'TAKE IT HOME',
        title: 'Put a clock on your own charts',
        body: "One question finds the gap in anything you ship: how much of this chart responds, and how much of it should? Flip the targets on and count the live pixels. A skinny pie slice or one band of a stacked area usually comes back low, and there’s your gap. If it already reads 100, the way that heatmap did when we started, then great. Go home. You’re done.",
      },
      {
        id: 'close-2',
        kicker: 'TAKEAWAY',
        title: 'The mark stays honest to the data; the target stays generous to the human',
        body: "That’s the invisible layer.",
      },
    ],
  },
]
