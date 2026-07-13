'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { scaleLinear } from 'd3-scale'
import { line as d3line } from 'd3-shape'
import { bisector } from 'd3-array'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL } from './shared/debug-toggle'
import { SegmentedControl } from './shared/segmented-control'
import { ChartTooltip } from './shared/chart-tooltip'
import { StageOverlay, PanelButton } from './shared/stage-overlay'
import { RoundResults, fmt } from './shared/round-results'
import { useRoundGame } from './shared/use-round-game'
import { useStageSync } from './shared/use-stage-sync'
import { VB, PLOT, toViewBox } from './shared/svg'
import { makeSeries, LINE_TARGETS, type SeriesPoint } from './shared/data'
import { DUR, EASE_OUT } from './shared/motion'

const copy = demoCopy['lines-trace']

// The cold open's exact chart — same seed, same 120 points. The phase
// that fixes the misery should fix THAT misery.
const DATA = makeSeries(7, 120)
const N = LINE_TARGETS.length
const TOL = 2 // ± indices; ≈10px of x at 120 points across the plot

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
type LinesStage = 'trace' | 'game-1' | 'computed' | 'game-2' | 'results' | 'craft'

// The hinge of the whole talk, now measured: round 1 makes you land
// clicks on the 2px stroke at five dates (the Steering Law, played);
// round 2 is the same five dates through one overlay rect + d3.bisector.
export function LinesTrace({ stage }: { stage?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const reducedMotion = useReducedMotion()

  const [mode, setMode] = useState<Mode>('trace')
  const [debug, setDebug] = useState(false)
  const [showResults, setShowResults] = useState(true)
  const [snapped, setSnapped] = useState<(typeof PTS)[number] | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [flash, setFlash] = useState<{ key: number; x: number; y: number } | null>(
    null,
  )

  const { state, dispatch, elapsed, targetStep } = useRoundGame({ hitsPerRound: N })
  const running = state.phase === 'running' ? state : null
  const targetIdx = targetStep !== null ? LINE_TARGETS[targetStep] : null

  const applyStage = useCallback(
    (s: string) => {
      switch (s as LinesStage) {
        case 'trace':
          setMode('trace')
          setDebug(false)
          dispatch({ type: 'disarm' })
          break
        case 'game-1':
          setMode('trace')
          setDebug(false)
          dispatch({ type: 'arm', round: 1 })
          break
        case 'computed':
          setMode('computed')
          setDebug(true)
          dispatch({ type: 'disarm' })
          break
        case 'game-2':
          setMode('computed')
          setDebug(false)
          dispatch({ type: 'arm', round: 2 })
          break
        case 'results':
          setShowResults(true)
          break
        case 'craft':
          setMode('computed')
          setDebug(false)
          setShowResults(false)
          break
      }
    },
    [dispatch],
  )
  useStageSync(stage, applyStage)

  // Fresh results always surface, even if a craft beat hid an older table.
  useEffect(() => {
    if (state.phase === 'results') setShowResults(true)
  }, [state.phase])

  const snapToPointer = (e: React.PointerEvent) => {
    if (!svgRef.current) return null
    const p = toViewBox(e, svgRef.current)
    const i = Math.max(0, Math.min(PTS.length - 1, bisectPx(PTS, p.x)))
    setCursor(p)
    setSnapped(PTS[i])
    return i
  }

  const clear = () => {
    setSnapped(null)
    setCursor(null)
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    clear()
  }

  // A click that reached the line (round 1) or the overlay (round 2):
  // right date → hit, wrong date → wrongHit. Never a dead-space miss.
  const judgeClick = (e: React.PointerEvent) => {
    e.stopPropagation()
    const i = snapToPointer(e)
    if (i === null || !running || targetIdx === null) return
    if (Math.abs(i - targetIdx) <= TOL) {
      const p = PTS[targetIdx]
      setFlash((f) => ({ key: (f?.key ?? 0) + 1, x: p.px, y: p.py }))
      dispatch({ type: 'hit', t: performance.now() })
    } else {
      dispatch({ type: 'wrongHit' })
    }
  }

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
    : stageIsCraft(stage) && state.phase === 'results' && !showResults
      ? copy.stages.craft
      : mode === 'trace'
        ? copy.hint
        : copy.stages.computed

  return (
    <DemoStage
      slotId="lines-trace"
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
        ) : undefined
      }
    >
      {/* Hide on the STAGE BODY's leave (not the overlay's) so the pointer
          can travel into the tooltip — the reason most tooltips vanish. */}
      <div
        className="h-full w-full"
        onPointerLeave={clear}
        onPointerDown={() => {
          // Dead space only exists in round 1 — round 2's overlay owns
          // every pixel of the plot.
          if (running?.round === 1) dispatch({ type: 'miss' })
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Line chart game comparing stroke-only click targets with a computed nearest-date overlay"
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

          {/* the five dates; #078 keeps its cold-open label */}
          {LINE_TARGETS.map((t, step) => {
            const isCurrent = running !== null && targetIdx === t
            const isDone = running !== null && targetStep !== null && step < targetStep
            return (
              <g key={t}>
                <line
                  x1={PTS[t].px}
                  x2={PTS[t].px}
                  y1={PLOT.y + PLOT.h}
                  y2={PLOT.y + PLOT.h + 6}
                  strokeWidth={2}
                  className={
                    isCurrent
                      ? 'stroke-accent'
                      : isDone
                        ? 'stroke-foreground/70'
                        : t === 78
                          ? 'stroke-accent/60'
                          : 'stroke-foreground/25'
                  }
                />
                {(t === 78 || isCurrent) && (
                  <text
                    x={PTS[t].px}
                    y={PLOT.y + PLOT.h + 18}
                    textAnchor="middle"
                    className={`font-mono text-[10px] ${
                      isCurrent ? 'fill-accent' : 'fill-accent/60'
                    }`}
                  >
                    #{String(t).padStart(3, '0')}
                  </text>
                )}
              </g>
            )
          })}

          <path
            d={PATH_D}
            fill="none"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            pointerEvents={
              running ? (running.round === 2 ? 'none' : undefined) : mode === 'computed' ? 'none' : undefined
            }
            onPointerMove={snapToPointer}
            onPointerDown={running?.round === 1 ? judgeClick : snapToPointer}
            onPointerLeave={running || mode === 'trace' ? clear : undefined}
            className={`stroke-foreground/80 ${
              mode === 'trace' || running?.round === 1 ? 'cursor-crosshair' : ''
            }`}
          />

          {/* the live target, ringed on the path so there's a place to aim */}
          {running && targetIdx !== null && (
            <motion.circle
              cx={PTS[targetIdx].px}
              cy={PTS[targetIdx].py}
              r={8}
              fill="none"
              strokeWidth={2}
              pointerEvents="none"
              className="stroke-accent"
              animate={reducedMotion ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
              }
            />
          )}

          {/* crosshair + marker, anchored to the SNAPPED datum */}
          {(mode === 'computed' || running?.round === 2) && snapped && (
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

          {/* hit flash at the struck date */}
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
            {mode === 'trace' && !running ? (
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
          {(mode === 'computed' || running?.round === 2) && (
            <rect
              x={PLOT.x}
              y={PLOT.y}
              width={PLOT.w}
              height={PLOT.h}
              fill="transparent"
              onPointerMove={snapToPointer}
              onPointerDown={running?.round === 2 ? judgeClick : snapToPointer}
              className="cursor-crosshair"
            />
          )}
        </svg>

        {snapped && (
          <ChartTooltip
            x={
              mode === 'trace' && running?.round !== 2
                ? (cursor?.x ?? snapped.px)
                : snapped.px
            }
            y={
              mode === 'trace' && running?.round !== 2
                ? (cursor?.y ?? snapped.py)
                : snapped.py
            }
            visible
          >
            <span className="text-muted-foreground">
              #{String(snapped.x).padStart(3, '0')}
            </span>{' '}
            <span className="text-foreground">{snapped.y.toFixed(1)}</span>
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

function stageIsCraft(stage?: string) {
  return stage === 'craft'
}
