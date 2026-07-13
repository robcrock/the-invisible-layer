'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { scaleLinear } from 'd3-scale'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL, DEBUG_STROKE } from './shared/debug-toggle'
import { ChartTooltip } from './shared/chart-tooltip'
import { VB, PLOT } from './shared/svg'
import { makeScatter } from './shared/data'
import { DUR, EASE_OUT } from './shared/motion'

const copy = demoCopy['scatter-before-after']

const DOT_R = 3

// Shared with voronoi-reveal (same seed) — the climax fixes THESE dots.
const DATA = makeScatter(23, 90)

const xScale = scaleLinear().domain([0, 100]).range([PLOT.x, PLOT.x + PLOT.w])
const yScale = scaleLinear().domain([0, 100]).range([PLOT.y + PLOT.h, PLOT.y])

const PTS = DATA.map((d) => ({ ...d, px: xScale(d.x), py: yScale(d.y) }))

// The first point of a planted near-coincident pair: its later-rendered
// twin steals naive hit-testing, so aiming at it yields the wrong name.
const TARGET_INDEX = DATA.length - 7
const TARGET = PTS[TARGET_INDEX]

// The devastating stat for the debug view: how much of the plot is live.
const LIVE_PCT = ((PTS.length * Math.PI * DOT_R * DOT_R) / (PLOT.w * PLOT.h)) * 100

// Tiny dots, two failure modes: outright misses, and — worse — hovering
// the visually-near-but-not-nearest point. Naive on purpose; the fix is
// the next widget.
export function ScatterBeforeAfter() {
  const reducedMotion = useReducedMotion()

  const [debug, setDebug] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const [misses, setMisses] = useState(0)
  const [wrongHits, setWrongHits] = useState(0)

  const hoveredPt = hovered !== null ? PTS[hovered] : null
  const found = hovered === TARGET_INDEX

  const hint = debug
    ? copy.stages.tease
    : found
      ? copy.stages.found
      : copy.hint.replace('{id}', TARGET.id)

  return (
    <DemoStage
      slotId="scatter-before-after"
      controls={<DebugToggle on={debug} onChange={setDebug} />}
      hint={hint}
      footer={
        debug ? (
          <span className="text-accent">
            {copy.results.livePixels.replace('{pct}', LIVE_PCT.toFixed(1))}
          </span>
        ) : (
          <>
            <span>
              {copy.results.hovering}{' '}
              <span className={found ? 'text-accent' : 'text-foreground'}>
                {hoveredPt?.id ?? '—'}
              </span>
            </span>
            <span>
              {copy.results.target}{' '}
              <span className="text-foreground">{TARGET.id}</span>
            </span>
            <span>
              {copy.results.misses} {misses}
            </span>
            <span>
              {copy.results.wrongHits} {wrongHits}
            </span>
          </>
        )
      }
    >
      <div
        className="h-full w-full"
        onPointerLeave={() => setHovered(null)}
        onPointerDown={() => setMisses((m) => m + 1)}
      >
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Scatter plot with deliberately tiny per-dot hover targets"
        >
          <line
            x1={PLOT.x}
            x2={PLOT.x + PLOT.w}
            y1={PLOT.y + PLOT.h}
            y2={PLOT.y + PLOT.h}
            className="stroke-foreground/20"
            strokeWidth={1}
          />
          <line
            x1={PLOT.x}
            x2={PLOT.x}
            y1={PLOT.y}
            y2={PLOT.y + PLOT.h}
            className="stroke-foreground/20"
            strokeWidth={1}
          />

          {/* the pulsing ask: this dot, half-buried in its cluster */}
          <motion.circle
            key={found ? 'found' : 'seeking'}
            cx={TARGET.px}
            cy={TARGET.py}
            r={9}
            fill="none"
            strokeWidth={1.5}
            initial={found ? { opacity: 0.9, scale: 1.05 } : false}
            animate={
              found
                ? { opacity: 1, scale: 1 }
                : reducedMotion
                  ? { opacity: 0.7 }
                  : { opacity: [0.35, 0.9, 0.35] }
            }
            transition={
              found
                ? { duration: DUR.base, ease: EASE_OUT }
                : reducedMotion
                  ? { duration: 0 }
                  : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            pointerEvents="none"
            className="stroke-accent"
          />

          {/* naive hit-testing: the dot IS the target, and DOM order
              decides who wins an overlap */}
          {PTS.map((p, i) => (
            <circle
              key={p.id}
              cx={p.px}
              cy={p.py}
              r={DOT_R}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              onPointerDown={(e) => {
                e.stopPropagation()
                if (i !== TARGET_INDEX) setWrongHits((w) => w + 1)
              }}
              className={`cursor-crosshair transition-colors duration-150 ${
                hovered === i ? 'fill-foreground' : 'fill-foreground/50'
              }`}
            />
          ))}

          <DebugLayer show={debug}>
            {/* the true hitboxes: confetti in an ocean of dead space */}
            {PTS.map((p) => (
              <circle
                key={p.id}
                cx={p.px}
                cy={p.py}
                r={DOT_R}
                strokeWidth={1}
                className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
              />
            ))}
          </DebugLayer>
        </svg>

        {hoveredPt && (
          <ChartTooltip x={hoveredPt.px} y={hoveredPt.py} visible>
            <span className={found ? 'text-accent' : 'text-foreground'}>
              {hoveredPt.id}
            </span>{' '}
            <span className="text-muted-foreground">
              {hoveredPt.x.toFixed(0)}, {hoveredPt.y.toFixed(0)}
            </span>
          </ChartTooltip>
        )}
      </div>
    </DemoStage>
  )
}
