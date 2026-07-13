'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL, DEBUG_STROKE } from './shared/debug-toggle'
import { SegmentedControl } from './shared/segmented-control'
import { ChartTooltip } from './shared/chart-tooltip'
import { StageOverlay, PanelButton } from './shared/stage-overlay'
import { RoundResults, fmt } from './shared/round-results'
import { useRoundGame } from './shared/use-round-game'
import { useStageSync } from './shared/use-stage-sync'
import { VB, PLOT } from './shared/svg'
import { BAR_DATA, makeTargetSequence } from './shared/data'
import { DUR, EASE_OUT } from './shared/motion'

const copy = demoCopy['bars-fitts']

const N = 10 // matches "ten clicks" in the bars copy

// The game dataset: every bar rudely short. Same A–H domain as BAR_DATA,
// so the chart morphs in place instead of being swapped out.
const FITTS_DATA: { label: string; value: number }[] = [
  { label: 'A', value: 3 },
  { label: 'B', value: 6 },
  { label: 'C', value: 2 },
  { label: 'D', value: 5 },
  { label: 'E', value: 3 },
  { label: 'F', value: 7 },
  { label: 'G', value: 2 },
  { label: 'H', value: 4 },
]

const xScale = scaleBand()
  .domain(BAR_DATA.map((d) => d.label))
  .range([PLOT.x, PLOT.x + PLOT.w])
  .padding(0.25)
const yScale = scaleLinear().domain([0, 100]).range([PLOT.y + PLOT.h, PLOT.y])

const step = xScale.step()
// Full scaleBand step, padding included — the category owns the whole column.
const bandX = (label: string) =>
  (xScale(label) ?? 0) - (step * xScale.paddingInner()) / 2
const barH = (value: number) => PLOT.y + PLOT.h - yScale(value)

// Same sequence both rounds — the comparison must be fair.
const TARGET_SEQ = makeTargetSequence(99, N, BAR_DATA.length)

type Mode = 'mark' | 'band'
type BarsStage = 'mark' | 'game-1' | 'band' | 'game-2' | 'results'

// The whole bars arc in one pinned widget: hover the honest chart, play
// the drawn-bar round, see the band layer, play the band round, read the
// measured delta.
export function BarsFitts({ stage }: { stage?: string }) {
  const [mode, setMode] = useState<Mode>('mark')
  const [debug, setDebug] = useState(false)
  // false = the realistic explore dataset; true = the rudely short game one.
  const [rude, setRude] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const [flash, setFlash] = useState<{
    key: number
    x: number
    y: number
    w: number
    h: number
  } | null>(null)
  const reducedMotion = useReducedMotion()

  const { state, dispatch, elapsed, targetStep } = useRoundGame({ hitsPerRound: N })
  const running = state.phase === 'running' ? state : null

  const applyStage = useCallback(
    (s: string) => {
      switch (s as BarsStage) {
        case 'mark':
          setMode('mark')
          setDebug(false)
          setRude(false)
          dispatch({ type: 'disarm' })
          break
        case 'game-1':
          setMode('mark')
          setDebug(false)
          setRude(true)
          dispatch({ type: 'arm', round: 1 })
          break
        case 'band':
          setMode('band')
          setDebug(true)
          setRude(true)
          dispatch({ type: 'disarm' })
          break
        case 'game-2':
          setMode('band')
          setDebug(false)
          setRude(true)
          dispatch({ type: 'arm', round: 2 })
          break
        case 'results':
          break // reached by play; nothing to force
      }
    },
    [dispatch],
  )
  useStageSync(stage, applyStage)

  const data = rude ? FITTS_DATA : BAR_DATA
  const hoveredBar = hovered !== null ? data[hovered] : null

  const targetIndex = targetStep !== null ? TARGET_SEQ[targetStep] : null
  const target = targetIndex !== null ? data[targetIndex] : null

  // Live hit geometry (round 1: the drawn bar; round 2: the band).
  const hitRect =
    running && target
      ? running.round === 1
        ? {
            x: xScale(target.label) ?? 0,
            y: yScale(target.value),
            w: xScale.bandwidth(),
            h: barH(target.value),
          }
        : { x: bandX(target.label), y: PLOT.y, w: step, h: PLOT.h }
      : null

  const onTargetDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    if (hitRect) setFlash((f) => ({ key: (f?.key ?? 0) + 1, ...hitRect }))
    dispatch({ type: 'hit', t: performance.now() })
  }

  const round1 =
    state.phase === 'running' || state.phase === 'armed'
      ? state.round1
      : state.phase === 'between'
        ? state.round1
        : undefined

  const hint = running
    ? running.round === 1
      ? copy.stages.round1
      : copy.stages.round2
    : mode === 'band'
      ? copy.stages.band
      : copy.hint

  return (
    <DemoStage
      slotId="bars-fitts"
      controls={
        <>
          <SegmentedControl
            ariaLabel="Hit-target mode"
            options={[
              { value: 'mark', label: copy.controls.mark },
              { value: 'band', label: copy.controls.band },
            ]}
            value={mode}
            onChange={setMode}
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
          </>
        ) : round1 ? (
          <span>
            {copy.results.round1} {fmt(round1.totalMs)}
            {round1.capped ? ' *' : ''}
          </span>
        ) : undefined
      }
    >
      <div
        className="h-full w-full"
        onPointerDown={() => dispatch({ type: 'miss' })}
        onPointerLeave={() => setHovered(null)}
      >
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Bar chart that morphs between honest data and rudely short bars for a timed clicking test of drawn-rectangle targets versus full-column band targets"
        >
          <line
            x1={PLOT.x}
            x2={PLOT.x + PLOT.w}
            y1={PLOT.y + PLOT.h}
            y2={PLOT.y + PLOT.h}
            className="stroke-foreground/20"
            strokeWidth={1}
          />

          {/* the marks — honest to the data, even when the data is rude */}
          {data.map((d, i) => {
            const isTarget = running !== null && i === targetIndex
            return (
              <motion.rect
                key={d.label}
                x={xScale(d.label)}
                width={xScale.bandwidth()}
                initial={false}
                animate={{
                  y: yScale(d.value),
                  height: barH(d.value),
                  opacity:
                    isTarget && !reducedMotion
                      ? [0.65, 1, 0.65]
                      : hovered === i
                        ? 1
                        : undefined,
                }}
                transition={{
                  y: { duration: reducedMotion ? 0 : DUR.reveal, ease: EASE_OUT },
                  height: {
                    duration: reducedMotion ? 0 : DUR.reveal,
                    ease: EASE_OUT,
                  },
                  opacity:
                    isTarget && !reducedMotion
                      ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0 },
                }}
                pointerEvents={
                  running ? (running.round === 2 ? 'none' : undefined) : mode === 'band' ? 'none' : undefined
                }
                onPointerDown={
                  running?.round === 1 && i === targetIndex ? onTargetDown : undefined
                }
                onPointerEnter={
                  !running && mode === 'mark' ? () => setHovered(i) : undefined
                }
                onPointerLeave={
                  !running && mode === 'mark' ? () => setHovered(null) : undefined
                }
                className={`${
                  isTarget
                    ? 'cursor-crosshair fill-accent'
                    : hovered === i
                      ? 'fill-foreground/90'
                      : 'fill-foreground/25'
                } ${!running && mode === 'mark' ? 'cursor-crosshair' : ''}`}
              />
            )
          })}

          {data.map((d) => (
            <text
              key={d.label}
              x={(xScale(d.label) ?? 0) + xScale.bandwidth() / 2}
              y={PLOT.y + PLOT.h + 18}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {d.label}
            </text>
          ))}

          {/* The invisible layer, explore flavor. SVG gotcha: fill="none"
              swallows pointer events — an invisible rect must use
              fill="transparent" (or pointerEvents="all") to stay hittable. */}
          {!running &&
            mode === 'band' &&
            data.map((d, i) => (
              <rect
                key={d.label}
                x={bandX(d.label)}
                y={PLOT.y}
                width={step}
                height={PLOT.h}
                fill="transparent"
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
                className="cursor-crosshair"
              />
            ))}

          {/* Round 2's invisible layer: the full-step band carries the hit. */}
          {running?.round === 2 && target && (
            <rect
              x={bandX(target.label)}
              y={PLOT.y}
              width={step}
              height={PLOT.h}
              fill="transparent"
              onPointerDown={onTargetDown}
              className="cursor-crosshair"
            />
          )}

          {/* hit flash — 150ms, re-keyed per hit, at the struck geometry */}
          <AnimatePresence>
            {flash && (
              <motion.rect
                key={flash.key}
                x={flash.x}
                y={flash.y}
                width={flash.w}
                height={flash.h}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: DUR.fast, ease: 'easeOut' }}
                pointerEvents="none"
                className="fill-accent"
              />
            )}
          </AnimatePresence>

          <DebugLayer show={debug}>
            {running && hitRect ? (
              <rect
                x={hitRect.x}
                y={hitRect.y}
                width={hitRect.w}
                height={hitRect.h}
                strokeWidth={1}
                className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
              />
            ) : mode === 'mark' ? (
              // the gasp: how little of the column is actually live
              data.map((d) => (
                <rect
                  key={d.label}
                  x={xScale(d.label)}
                  y={yScale(d.value)}
                  width={xScale.bandwidth()}
                  height={barH(d.value)}
                  strokeWidth={1}
                  className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
                />
              ))
            ) : (
              // same treatment, ~100× the area; 1px gaps keep the
              // targets reading as discrete
              data.map((d) => (
                <rect
                  key={d.label}
                  x={bandX(d.label) + 0.5}
                  y={PLOT.y}
                  width={step - 1}
                  height={PLOT.h}
                  strokeWidth={1}
                  className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
                />
              ))
            )}
          </DebugLayer>
        </svg>

        {!running && hoveredBar && (
          <ChartTooltip
            x={(xScale(hoveredBar.label) ?? 0) + xScale.bandwidth() / 2}
            y={yScale(hoveredBar.value)}
            visible
          >
            <span className="text-muted-foreground">{hoveredBar.label}</span>{' '}
            <span className="text-foreground">{hoveredBar.value}</span>
          </ChartTooltip>
        )}

        <StageOverlay
          show={state.phase === 'armed' || state.phase === 'results'}
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
              <p className="max-w-[36ch] text-center font-mono text-xs text-muted-foreground">
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
              onReset={() => dispatch({ type: 'reset' })}
            />
          )}
        </StageOverlay>
      </div>
    </DemoStage>
  )
}
