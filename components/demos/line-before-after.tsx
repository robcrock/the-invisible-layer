'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { scaleLinear } from 'd3-scale'
import { line as d3line } from 'd3-shape'
import { bisector } from 'd3-array'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL } from './shared/debug-toggle'
import { SegmentedControl } from './shared/segmented-control'
import { ChartTooltip } from './shared/chart-tooltip'
import { VB, PLOT, toViewBox } from './shared/svg'
import { makeSeries, type SeriesPoint } from './shared/data'
import { EASE_OUT } from './shared/motion'

const copy = demoCopy['line-before-after']

// Calmer than the cold open — this one is about the fix.
const DATA = makeSeries(11, 60)

const xScale = scaleLinear()
  .domain([0, DATA.length - 1])
  .range([PLOT.x, PLOT.x + PLOT.w])
const yScale = scaleLinear().domain([0, 100]).range([PLOT.y + PLOT.h, PLOT.y])

const PTS = DATA.map((d) => ({ ...d, px: xScale(d.x), py: yScale(d.y) }))
const PATH_D =
  d3line<SeriesPoint>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))(DATA) ?? ''

const bisectPx = bisector<(typeof PTS)[number], number>((d) => d.px).center

type Mode = 'trace' | 'computed'

// The hinge of the whole talk: the target stops being drawn and becomes
// computed. TRACE reproduces the misery (and the vanishing-tooltip
// anti-pattern); COMPUTED is one overlay rect + bisector math.
export function LineBeforeAfter() {
  const svgRef = useRef<SVGSVGElement>(null)
  const reducedMotion = useReducedMotion()

  const [mode, setMode] = useState<Mode>('trace')
  const [debug, setDebug] = useState(false)
  const [snapped, setSnapped] = useState<(typeof PTS)[number] | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)

  const snapToPointer = (e: React.PointerEvent) => {
    if (!svgRef.current) return
    const p = toViewBox(e, svgRef.current)
    const i = Math.max(0, Math.min(PTS.length - 1, bisectPx(PTS, p.x)))
    setCursor(p)
    setSnapped(PTS[i])
  }

  const clear = () => {
    setSnapped(null)
    setCursor(null)
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    clear()
  }

  return (
    <DemoStage
      slotId="line-before-after"
      controls={
        <>
          <SegmentedControl
            ariaLabel="Hit-target mode"
            options={[
              { value: 'trace', label: copy.controls.trace },
              { value: 'computed', label: copy.controls.computed },
            ]}
            value={mode}
            onChange={switchMode}
          />
          <DebugToggle on={debug} onChange={setDebug} />
        </>
      }
      hint={mode === 'trace' ? copy.hint : copy.stages.computed}
    >
      {/* Hide on the STAGE BODY's leave (not the overlay's) so the pointer
          can travel into the tooltip — the reason most tooltips vanish. */}
      <div className="h-full w-full" onPointerLeave={clear}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Line chart comparing stroke-only hover targets with a computed nearest-point target"
        >
          {[25, 50, 75].map((v) => (
            <line
              key={v}
              x1={PLOT.x}
              x2={PLOT.x + PLOT.w}
              y1={yScale(v)}
              y2={yScale(v)}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}
          <line
            x1={PLOT.x}
            x2={PLOT.x + PLOT.w}
            y1={PLOT.y + PLOT.h}
            y2={PLOT.y + PLOT.h}
            className="stroke-foreground/20"
            strokeWidth={1}
          />
          {[0, 50, 100].map((v) => (
            <text
              key={v}
              x={PLOT.x - 8}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {v}
            </text>
          ))}

          <path
            d={PATH_D}
            fill="none"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            pointerEvents={mode === 'computed' ? 'none' : undefined}
            onPointerMove={mode === 'trace' ? snapToPointer : undefined}
            onPointerDown={mode === 'trace' ? snapToPointer : undefined}
            onPointerLeave={mode === 'trace' ? clear : undefined}
            className={`stroke-foreground/80 ${
              mode === 'trace' ? 'cursor-crosshair' : ''
            }`}
          />

          {/* crosshair + marker, anchored to the SNAPPED datum */}
          {mode === 'computed' && snapped && (
            <>
              <motion.g
                animate={{ x: snapped.px }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.12, ease: EASE_OUT }
                }
                pointerEvents="none"
              >
                <line
                  x1={0}
                  x2={0}
                  y1={PLOT.y}
                  y2={PLOT.y + PLOT.h}
                  className="stroke-foreground/30"
                  strokeWidth={1}
                />
              </motion.g>
              <motion.g
                animate={{ x: snapped.px, y: snapped.py }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.12, ease: EASE_OUT }
                }
                pointerEvents="none"
              >
                <circle
                  r={5}
                  fill="none"
                  strokeWidth={2}
                  className="stroke-accent"
                />
              </motion.g>
            </>
          )}

          <DebugLayer show={debug}>
            {mode === 'trace' ? (
              // the grim callback: the target is still just the stroke
              <path
                d={PATH_D}
                fill="none"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                className="stroke-accent"
              />
            ) : (
              // the visual thesis: the target is now EVERYTHING
              <>
                <rect
                  x={PLOT.x}
                  y={PLOT.y}
                  width={PLOT.w}
                  height={PLOT.h}
                  className={DEBUG_FILL}
                />
                {cursor && snapped && (
                  <line
                    x1={cursor.x}
                    y1={cursor.y}
                    x2={snapped.px}
                    y2={snapped.py}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    className="stroke-accent"
                  />
                )}
              </>
            )}
          </DebugLayer>

          {/* the target is computed, not drawn */}
          {mode === 'computed' && (
            <rect
              x={PLOT.x}
              y={PLOT.y}
              width={PLOT.w}
              height={PLOT.h}
              fill="transparent"
              onPointerMove={snapToPointer}
              onPointerDown={snapToPointer}
              className="cursor-crosshair"
            />
          )}
        </svg>

        {snapped && (
          <ChartTooltip
            x={mode === 'trace' ? (cursor?.x ?? snapped.px) : snapped.px}
            y={mode === 'trace' ? (cursor?.y ?? snapped.py) : snapped.py}
            visible
          >
            <span className="text-muted-foreground">
              #{String(snapped.x).padStart(3, '0')}
            </span>{' '}
            <span className="text-foreground">{snapped.y.toFixed(1)}</span>
          </ChartTooltip>
        )}
      </div>
    </DemoStage>
  )
}
