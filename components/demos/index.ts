import type { ComponentType } from 'react'
import { PixelHunt } from './pixel-hunt'
import { BarsFitts } from './bars-fitts'
import { LinesTrace } from './lines-trace'
import { ScatterBeforeAfter } from './scatter-before-after'
import { VoronoiReveal } from './voronoi-reveal'

// Every widget accepts an optional scroll-driven stage; widgets with no
// stage handling simply ignore it and stay fully presenter-controlled.
export type DemoProps = { stage?: string }

// Demo id → widget. Ids missing here fall back to the dashed DemoSlot
// placeholder, so widgets land one at a time without touching the deck.
export const demoRegistry: Record<string, ComponentType<DemoProps>> = {
  'cold-open-pixel-hunt': PixelHunt,
  'bars-fitts': BarsFitts,
  'lines-trace': LinesTrace,
  'scatter-before-after': ScatterBeforeAfter,
  'voronoi-reveal': VoronoiReveal,
}
