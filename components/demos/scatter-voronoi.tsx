'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { scaleLinear } from 'd3-scale'
import { Delaunay } from 'd3-delaunay'
import { quadtree } from 'd3-quadtree'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL, DEBUG_STROKE } from './shared/debug-toggle'
import { ChartTooltip } from './shared/chart-tooltip'
import { SegmentedControl } from './shared/segmented-control'
import { StageOverlay, PanelButton } from './shared/stage-overlay'
import { RoundResults, fmt } from './shared/round-results'
import { useRoundGame } from './shared/use-round-game'
import { useStageSync } from './shared/use-stage-sync'
import { VB, PLOT, toViewBox } from './shared/svg'
import { makeScatter, SCATTER_TARGETS } from './shared/data'
import { DUR, EASE_OUT } from './shared/motion'

const copy = demoCopy['scatter-voronoi']

const DOT_R = 3
const N = SCATTER_TARGETS.length

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

// The explore-stage ask: the first point of a planted near-coincident
// pair, whose later-rendered twin steals naive hit-testing.
const TWIN_INDEX = DATA.length - 7
const TWIN = PTS[TWIN_INDEX]

// The devastating stat for the debug view: how much of the plot is live.
const LIVE_PCT = ((PTS.length * Math.PI * DOT_R * DOT_R) / (PLOT.w * PLOT.h)) * 100

type Mode = 'naive' | 'nearest' | 'clamp'
type ScatterStage = 'naive' | 'game-1' | 'voronoi' | 'game-2' | 'results' | 'clamp'

// The scatter arc in one pinned widget: fail on 3px dots (and their
// planted twins), play the timed find-five round, watch delaunay.find
// hand every pixel an owner, replay, then clamp the radius and feel the
// tradeoff.
export function ScatterVoronoi({ stage }: { stage?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const uid = useId()
  const reducedMotion = useReducedMotion()

  const [mode, setMode] = useState<Mode>('naive')
  const [debug, setDebug] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [radius, setRadius] = useState(64)
  const [active, setActive] = useState<number | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [flash, setFlash] = useState<{ key: number; x: number; y: number } | null>(
    null,
  )
  // warm start for delaunay.find — the documented perf idiom
  const lastFound = useRef(0)

  const { state, dispatch, elapsed, targetStep } = useRoundGame({ hitsPerRound: N })
  const running = state.phase === 'running' ? state : null
  const gameTarget = targetStep !== null ? SCATTER_TARGETS[targetStep] : null

  const applyStage = useCallback(
    (s: string) => {
      switch (s as ScatterStage) {
        case 'naive':
          setMode('naive')
          setDebug(false)
          dispatch({ type: 'disarm' })
          break
        case 'game-1':
          setMode('naive')
          setDebug(false)
          dispatch({ type: 'arm', round: 1 })
          break
        case 'voronoi':
          setMode('nearest')
          setDebug(true)
          dispatch({ type: 'disarm' })
          break
        case 'game-2':
          setMode('nearest')
          setDebug(false)
          dispatch({ type: 'arm', round: 2 })
          break
        case 'results':
          setShowResults(true)
          break
        case 'clamp':
          setMode('clamp')
          setDebug(true)
          setShowResults(false)
          dispatch({ type: 'disarm' })
          break
      }
    },
    [dispatch],
  )
  useStageSync(stage, applyStage)

  useEffect(() => {
    if (state.phase === 'results') setShowResults(true)
  }, [state.phase])

  const findFromPointer = (e: React.PointerEvent) => {
    if (!svgRef.current) return null
    const p = toViewBox(e, svgRef.current)
    setCursor(p)
    if (mode === 'nearest' || running?.round === 2) {
      const i = delaunay.find(p.x, p.y, lastFound.current)
      if (i >= 0) {
        lastFound.current = i
        setActive(i)
        return i
      }
      return null
    }
    // clamp: outside the radius, nobody owns the pixel — on purpose
    const hit = qt.find(p.x, p.y, radius)
    const i = hit ? PTS.indexOf(hit) : null
    setActive(i)
    return i
  }

  const clear = () => {
    setActive(null)
    setCursor(null)
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    clear()
  }

  const hitDot = (i: number) => {
    if (!running || gameTarget === null) return
    if (i === gameTarget) {
      const p = PTS[i]
      setFlash((f) => ({ key: (f?.key ?? 0) + 1, x: p.px, y: p.py }))
      dispatch({ type: 'hit', t: performance.now() })
    } else {
      dispatch({ type: 'wrongHit' })
    }
  }

  const activePt = active !== null ? PTS[active] : null
  const exploringNaive = mode === 'naive' && !running
  const foundTwin = exploringNaive && active === TWIN_INDEX

  const round1 =
    state.phase === 'armed' || state.phase === 'running'
      ? state.round1
      : state.phase === 'between'
        ? state.round1
        : undefined

  const resultsDelta =
    state.phase === 'results'
      ? Math.max(
          0,
          Math.round(
            state.round1.totalMs / Math.max(1, state.round1.hits) -
              state.round2.totalMs / Math.max(1, state.round2.hits),
          ),
        )
      : null

  const hint = running
    ? running.round === 1
      ? copy.stages.round1
      : copy.stages.round2
    : exploringNaive
      ? debug
        ? copy.stages.tease
        : foundTwin
          ? copy.stages.found
          : copy.hint.replace('{id}', TWIN.id)
      : mode === 'nearest'
        ? copy.stages.nearest
        : mode === 'clamp'
          ? copy.stages.clamp
          : copy.hint.replace('{id}', TWIN.id)

  return (
    <DemoStage
      slotId="scatter-voronoi"
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
      hint={hint}
      footer={
        running ? (
          <>
            <span className="text-foreground">{fmt(elapsed)}</span>
            <span>
              {running.hits}/{N}
            </span>
            <span>
              {copy.results.misses} {running.misses}
            </span>
            <span>
              {copy.results.wrongHits} {running.wrongHits}
            </span>
          </>
        ) : state.phase === 'results' && !showResults && resultsDelta !== null ? (
          <span className="text-accent">
            {copy.results.delta.replace('{delta}', String(resultsDelta))}
          </span>
        ) : round1 ? (
          <span>
            {copy.results.round1} {fmt(round1.totalMs)}
            {round1.capped ? ' *' : ''}
          </span>
        ) : exploringNaive && debug ? (
          <span className="text-accent">
            {copy.results.livePixels.replace('{pct}', LIVE_PCT.toFixed(1))}
          </span>
        ) : exploringNaive ? (
          <>
            <span>
              {copy.results.hovering}{' '}
              <span className={foundTwin ? 'text-accent' : 'text-foreground'}>
                {activePt?.id ?? '—'}
              </span>
            </span>
            <span>
              {copy.results.target}{' '}
              <span className="text-foreground">{TWIN.id}</span>
            </span>
          </>
        ) : undefined
      }
    >
      <div
        className="h-full w-full"
        onPointerLeave={clear}
        onPointerDown={() => {
          // Dead space only exists while the dots themselves are the
          // targets — round 2's overlay owns every pixel of the plot.
          if (running?.round === 1) dispatch({ type: 'miss' })
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Scatter plot game comparing per-dot hit targets with nearest-point Voronoi ownership and a clamped radius"
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

          {/* the pulsing ask: the twin victim while exploring, the live
              game target while a round runs */}
          {(exploringNaive || (running && gameTarget !== null)) && (
            <motion.circle
              key={running ? `game-${gameTarget}` : foundTwin ? 'found' : 'seeking'}
              cx={running && gameTarget !== null ? PTS[gameTarget].px : TWIN.px}
              cy={running && gameTarget !== null ? PTS[gameTarget].py : TWIN.py}
              r={9}
              fill="none"
              strokeWidth={1.5}
              initial={foundTwin ? { opacity: 0.9, scale: 1.05 } : false}
              animate={
                foundTwin
                  ? { opacity: 1, scale: 1 }
                  : reducedMotion
                    ? { opacity: 0.7 }
                    : { opacity: [0.35, 0.9, 0.35] }
              }
              transition={
                foundTwin
                  ? { duration: DUR.base, ease: EASE_OUT }
                  : reducedMotion
                    ? { duration: 0 }
                    : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              pointerEvents="none"
              className="stroke-accent"
            />
          )}

          {/* naive hit-testing: the dot IS the target, and DOM order
              decides who wins an overlap */}
          {PTS.map((p, i) => (
            <circle
              key={p.id}
              cx={p.px}
              cy={p.py}
              r={DOT_R}
              onPointerEnter={
                mode === 'naive' && running?.round !== 2
                  ? () => setActive(i)
                  : undefined
              }
              onPointerLeave={
                mode === 'naive' && running?.round !== 2
                  ? () => setActive(null)
                  : undefined
              }
              onPointerDown={
                mode === 'naive' && running?.round !== 2
                  ? (e) => {
                      e.stopPropagation()
                      hitDot(i)
                    }
                  : undefined
              }
              className={`transition-colors duration-150 ${
                active === i ? 'fill-foreground' : 'fill-foreground/50'
              } ${mode === 'naive' ? 'cursor-crosshair' : ''}`}
            />
          ))}

          {/* active-point ring */}
          {activePt && !running && mode !== 'naive' && (
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

          {/* hit flash at the struck dot */}
          <AnimatePresence>
            {flash && (
              <motion.circle
                key={flash.key}
                cx={flash.x}
                cy={flash.y}
                r={12}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                transition={{ duration: DUR.fast, ease: 'easeOut' }}
                pointerEvents="none"
                className="fill-accent"
              />
            )}
          </AnimatePresence>

          <DebugLayer show={debug}>
            {mode === 'naive' &&
              // the gasp: confetti-sized targets, ocean of dead space
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
          {(mode !== 'naive' || running?.round === 2) && (
            <rect
              x={PLOT.x}
              y={PLOT.y}
              width={PLOT.w}
              height={PLOT.h}
              fill="transparent"
              onPointerMove={findFromPointer}
              onPointerDown={
                running?.round === 2
                  ? (e) => {
                      e.stopPropagation()
                      const i = findFromPointer(e)
                      if (i !== null) hitDot(i)
                    }
                  : findFromPointer
              }
              className="cursor-crosshair"
            />
          )}
        </svg>

        {activePt && (
          <ChartTooltip x={activePt.px} y={activePt.py} visible>
            <span className={foundTwin ? 'text-accent' : 'text-foreground'}>
              {activePt.id}
            </span>{' '}
            <span className="text-muted-foreground">
              {activePt.x.toFixed(0)}, {activePt.y.toFixed(0)}
            </span>
          </ChartTooltip>
        )}

        <StageOverlay
          show={
            state.phase === 'armed' || (state.phase === 'results' && showResults)
          }
          stateKey={
            state.phase === 'armed' ? `armed-${state.round}` : state.phase
          }
        >
          {state.phase === 'armed' && (
            <>
              {state.round === 2 && state.round1 && (
                <p className="font-mono text-2xl tabular-nums text-foreground">
                  {fmt(state.round1.totalMs)}
                  {state.round1.capped && (
                    <span className="ml-2 text-sm text-accent">
                      {copy.stages.capped}
                    </span>
                  )}
                </p>
              )}
              <p className="max-w-[38ch] text-center font-mono text-xs text-muted-foreground">
                {state.round === 1 ? copy.stages.armed1 : copy.stages.armed2}
              </p>
              <PanelButton
                label={
                  state.round === 1 ? copy.controls.start1 : copy.controls.start2
                }
                onClick={() => dispatch({ type: 'start', t: performance.now() })}
              />
            </>
          )}

          {state.phase === 'results' && (
            <RoundResults
              copy={copy.results}
              round1={state.round1}
              round2={state.round2}
              rows={['total', 'perHit', 'misses', 'wrongHits']}
              onReset={() => dispatch({ type: 'reset' })}
            />
          )}
        </StageOverlay>
      </div>
    </DemoStage>
  )
}
