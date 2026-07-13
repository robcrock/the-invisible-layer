'use client'

import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { scaleLinear } from 'd3-scale'
import { Delaunay } from 'd3-delaunay'
import { quadtree } from 'd3-quadtree'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL, DEBUG_STROKE } from './shared/debug-toggle'
import { ChartTooltip } from './shared/chart-tooltip'
import { SegmentedControl } from './shared/segmented-control'
import { VB, PLOT, toViewBox } from './shared/svg'
import { makeScatter } from './shared/data'
import { DUR, EASE_OUT } from './shared/motion'

const copy = demoCopy['voronoi-reveal']

const DOT_R = 3

// The SAME dots the audience just failed on in scatter-before-after.
const DATA = makeScatter(23, 90)

const xScale = scaleLinear().domain([0, 100]).range([PLOT.x, PLOT.x + PLOT.w])
const yScale = scaleLinear().domain([0, 100]).range([PLOT.y + PLOT.h, PLOT.y])

const PTS = DATA.map((d) => ({ ...d, px: xScale(d.x), py: yScale(d.y) }))

// Data is static, so all the geometry is built once at module scope.
const delaunay = Delaunay.from(
  PTS,
  (d) => d.px,
  (d) => d.py,
)
const voronoi = delaunay.voronoi([PLOT.x, PLOT.y, PLOT.x + PLOT.w, PLOT.y + PLOT.h])
// renderCell can return '' for degenerate cells — drop those.
const CELLS = PTS.map((_, i) => voronoi.renderCell(i) || null)
const qt = quadtree<(typeof PTS)[number]>()
  .x((d) => d.px)
  .y((d) => d.py)
  .addAll(PTS)

type Mode = 'naive' | 'nearest' | 'clamp'

// The climax: every pixel belongs to a point (delaunay.find), then the
// radius clamp (quadtree.find) turns 100% coverage into a live design
// decision — dead zones vs mis-triggers, no universal answer.
export function VoronoiReveal() {
  const svgRef = useRef<SVGSVGElement>(null)
  const uid = useId()
  const reducedMotion = useReducedMotion()

  const [mode, setMode] = useState<Mode>('naive')
  const [debug, setDebug] = useState(false)
  const [radius, setRadius] = useState(64)
  const [active, setActive] = useState<number | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  // warm start for delaunay.find — the documented perf idiom
  const lastFound = useRef(0)

  const findFromPointer = (e: React.PointerEvent) => {
    if (!svgRef.current) return
    const p = toViewBox(e, svgRef.current)
    setCursor(p)
    if (mode === 'nearest') {
      const i = delaunay.find(p.x, p.y, lastFound.current)
      if (i >= 0) {
        lastFound.current = i
        setActive(i)
      }
    } else {
      // clamp: outside the radius, nobody owns the pixel — on purpose
      const hit = qt.find(p.x, p.y, radius)
      setActive(hit ? PTS.indexOf(hit) : null)
    }
  }

  const clear = () => {
    setActive(null)
    setCursor(null)
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    clear()
  }

  const activePt = active !== null ? PTS[active] : null

  return (
    <DemoStage
      slotId="voronoi-reveal"
      controls={
        <>
          <SegmentedControl
            ariaLabel="Hit-testing strategy"
            options={[
              { value: 'naive', label: copy.controls.naive },
              { value: 'nearest', label: copy.controls.nearest },
              { value: 'clamp', label: copy.controls.clamp },
            ]}
            value={mode}
            onChange={switchMode}
          />
          <AnimatePresence>
            {mode === 'clamp' && (
              <motion.label
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.base, ease: EASE_OUT }}
                className="flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground"
              >
                <input
                  type="range"
                  min={24}
                  max={140}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="h-1 w-20 cursor-ew-resize accent-accent"
                  aria-label="Clamp radius"
                />
                <span className="tabular-nums text-foreground">
                  r = {radius}px
                </span>
              </motion.label>
            )}
          </AnimatePresence>
          <DebugToggle on={debug} onChange={setDebug} />
        </>
      }
      hint={mode === 'naive' ? copy.stages.naive : copy.hint}
      footer={
        <span className={mode === 'clamp' ? 'text-accent' : undefined}>
          {copy.stages[mode]}
        </span>
      }
    >
      <div className="h-full w-full" onPointerLeave={clear}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Scatter plot where nearest-point lookup gives every pixel an owner"
        >
          {mode === 'clamp' && debug && (
            <defs>
              {PTS.map((p, i) =>
                CELLS[i] ? (
                  <clipPath key={p.id} id={`${uid}-c${i}`}>
                    <circle cx={p.px} cy={p.py} r={radius} />
                  </clipPath>
                ) : null,
              )}
            </defs>
          )}

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

          {PTS.map((p, i) => (
            <circle
              key={p.id}
              cx={p.px}
              cy={p.py}
              r={DOT_R}
              onPointerEnter={mode === 'naive' ? () => setActive(i) : undefined}
              onPointerLeave={mode === 'naive' ? () => setActive(null) : undefined}
              className={`transition-colors duration-150 ${
                active === i ? 'fill-foreground' : 'fill-foreground/50'
              } ${mode === 'naive' ? 'cursor-crosshair' : ''}`}
            />
          ))}

          {/* active-point ring */}
          {activePt && (
            <motion.g
              animate={{ x: activePt.px, y: activePt.py }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: DUR.fast, ease: EASE_OUT }
              }
              pointerEvents="none"
            >
              <circle r={7} fill="none" strokeWidth={2} className="stroke-accent" />
            </motion.g>
          )}

          <DebugLayer show={debug}>
            {mode === 'naive' &&
              // the recap: confetti-sized targets, ocean of dead space
              PTS.map((p) => (
                <circle
                  key={p.id}
                  cx={p.px}
                  cy={p.py}
                  r={DOT_R}
                  strokeWidth={1}
                  className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
                />
              ))}

            {mode === 'nearest' &&
              // every pixel belongs to somebody: the full Voronoi tessellation
              PTS.map((p, i) =>
                CELLS[i] ? (
                  <path
                    key={p.id}
                    d={CELLS[i]}
                    strokeWidth={1}
                    className={
                      active === i
                        ? 'fill-accent/30 stroke-accent'
                        : `${DEBUG_FILL} ${DEBUG_STROKE}`
                    }
                  />
                ) : null,
              )}

            {mode === 'clamp' && (
              <>
                {/* the geometrically true target: cell ∩ disc. The gaps
                    between these shapes ARE the dead zones. */}
                {PTS.map((p, i) =>
                  CELLS[i] ? (
                    <path
                      key={p.id}
                      d={CELLS[i]}
                      clipPath={`url(#${uid}-c${i})`}
                      strokeWidth={1}
                      className={
                        active === i
                          ? 'fill-accent/30 stroke-accent'
                          : `${DEBUG_FILL} ${DEBUG_STROKE}`
                      }
                    />
                  ) : null,
                )}
                {/* why that hover hit (or didn't): the reach of the clamp */}
                {cursor && (
                  <circle
                    cx={cursor.x}
                    cy={cursor.y}
                    r={radius}
                    fill="none"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    className="stroke-accent/50"
                  />
                )}
              </>
            )}
          </DebugLayer>

          {/* One overlay, computed targets. delaunay.find / quadtree.find —
              the whole invisible layer is five lines of math. */}
          {mode !== 'naive' && (
            <rect
              x={PLOT.x}
              y={PLOT.y}
              width={PLOT.w}
              height={PLOT.h}
              fill="transparent"
              onPointerMove={findFromPointer}
              onPointerDown={findFromPointer}
              className="cursor-crosshair"
            />
          )}
        </svg>

        {activePt && (
          <ChartTooltip x={activePt.px} y={activePt.py} visible>
            <span className="text-foreground">{activePt.id}</span>{' '}
            <span className="text-muted-foreground">
              {activePt.x.toFixed(0)}, {activePt.y.toFixed(0)}
            </span>
          </ChartTooltip>
        )}
      </div>
    </DemoStage>
  )
}
