'use client'

import { useEffect, useReducer, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { scaleBand } from 'd3-scale'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL, DEBUG_STROKE } from './shared/debug-toggle'
import { VB, PLOT } from './shared/svg'
import { makeTargetSequence } from './shared/data'
import { DUR, EASE_OUT } from './shared/motion'

const copy = demoCopy['fitts-timer']

const N = 10 // matches "ten times" in the bars-4 beat copy
const CAP_MS = 25_000 // mercy ceiling — "you get the point"

// A rudely short dataset: every drawn bar is a handful of pixels tall.
// Round 1 makes you click these; round 2 gives you the band.
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
  .domain(FITTS_DATA.map((d) => d.label))
  .range([PLOT.x, PLOT.x + PLOT.w])
  .padding(0.25)
const step = xScale.step()
const bandX = (label: string) => (xScale(label) ?? 0) - (step * xScale.paddingInner()) / 2
const barH = (value: number) => (value / 100) * PLOT.h
const barY = (value: number) => PLOT.y + PLOT.h - barH(value)

// Same sequence both rounds — the comparison must be fair.
const TARGET_SEQ = makeTargetSequence(99, N, FITTS_DATA.length)

type RoundResult = {
  totalMs: number
  hits: number
  misses: number
  capped: boolean
}

type FittsState =
  | { phase: 'idle' }
  | {
      phase: 'running'
      round: 1 | 2
      round1?: RoundResult
      hits: number
      misses: number
      startedAt: number
    }
  | { phase: 'interstitial'; round1: RoundResult }
  | { phase: 'results'; round1: RoundResult; round2: RoundResult }

type FittsEvent =
  | { type: 'start'; t: number }
  | { type: 'hit'; t: number }
  | { type: 'miss' }
  | { type: 'cap'; t: number }
  | { type: 'continue'; t: number }
  | { type: 'reset' }

function finishRound(
  s: Extract<FittsState, { phase: 'running' }>,
  t: number,
  capped: boolean,
): FittsState {
  const result: RoundResult = {
    totalMs: t - s.startedAt,
    hits: capped ? s.hits : s.hits + 1,
    misses: s.misses,
    capped,
  }
  if (s.round === 1) return { phase: 'interstitial', round1: result }
  return { phase: 'results', round1: s.round1!, round2: result }
}

function reducer(s: FittsState, e: FittsEvent): FittsState {
  switch (e.type) {
    case 'start':
      return s.phase === 'idle'
        ? { phase: 'running', round: 1, hits: 0, misses: 0, startedAt: e.t }
        : s
    case 'continue':
      return s.phase === 'interstitial'
        ? {
            phase: 'running',
            round: 2,
            round1: s.round1,
            hits: 0,
            misses: 0,
            startedAt: e.t,
          }
        : s
    case 'hit':
      if (s.phase !== 'running') return s
      if (s.hits + 1 >= N) return finishRound(s, e.t, false)
      return { ...s, hits: s.hits + 1 }
    case 'miss':
      return s.phase === 'running' ? { ...s, misses: s.misses + 1 } : s
    case 'cap':
      return s.phase === 'running' ? finishRound(s, e.t, true) : s
    case 'reset':
      return { phase: 'idle' }
  }
}

function fmt(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`
}

// The one quantified moment: interaction, measured.
export function FittsTimer() {
  const [state, dispatch] = useReducer(reducer, { phase: 'idle' })
  const [debug, setDebug] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const reducedMotion = useReducedMotion()
  // the struck geometry, captured at hit time (the live target relocates
  // immediately, so the flash can't read it after dispatch)
  const [flash, setFlash] = useState<{
    key: number
    x: number
    y: number
    w: number
    h: number
  } | null>(null)

  const running = state.phase === 'running' ? state : null

  // Display clock — rAF only touches display state, never the machine.
  useEffect(() => {
    if (!running) return
    let raf = 0
    const tick = () => {
      setElapsed(performance.now() - running.startedAt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  // Mercy cap per round.
  useEffect(() => {
    if (!running) return
    const id = setTimeout(
      () => dispatch({ type: 'cap', t: performance.now() }),
      CAP_MS,
    )
    return () => clearTimeout(id)
  }, [running])

  const targetIndex = running ? TARGET_SEQ[running.hits] : null
  const target = targetIndex !== null ? FITTS_DATA[targetIndex] : null

  // Current live hit geometry (round 1: the drawn bar; round 2: the band).
  const hitRect =
    running && target
      ? running.round === 1
        ? {
            x: xScale(target.label) ?? 0,
            y: barY(target.value),
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

  const hint =
    state.phase === 'running'
      ? state.round === 1
        ? copy.stages.round1
        : copy.stages.round2
      : copy.hint

  return (
    <DemoStage
      slotId="fitts-timer"
      controls={<DebugToggle on={debug} onChange={setDebug} />}
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
        ) : undefined
      }
    >
      <div
        className="h-full w-full"
        onPointerDown={() => dispatch({ type: 'miss' })}
      >
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Timed clicking test comparing tiny bar targets with full-column band targets"
        >
          <line
            x1={PLOT.x}
            x2={PLOT.x + PLOT.w}
            y1={PLOT.y + PLOT.h}
            y2={PLOT.y + PLOT.h}
            className="stroke-foreground/20"
            strokeWidth={1}
          />

          {FITTS_DATA.map((d, i) => (
            <motion.rect
              key={d.label}
              x={xScale(d.label)}
              y={barY(d.value)}
              width={xScale.bandwidth()}
              height={barH(d.value)}
              onPointerDown={
                running?.round === 1 && i === targetIndex
                  ? onTargetDown
                  : undefined
              }
              animate={
                i === targetIndex && !reducedMotion
                  ? { opacity: [0.65, 1, 0.65] }
                  : { opacity: 1 }
              }
              transition={
                i === targetIndex && !reducedMotion
                  ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0 }
              }
              className={
                i === targetIndex
                  ? 'cursor-crosshair fill-accent'
                  : 'fill-foreground/25'
              }
            />
          ))}

          {FITTS_DATA.map((d) => (
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
            {hitRect && (
              <rect
                x={hitRect.x}
                y={hitRect.y}
                width={hitRect.w}
                height={hitRect.h}
                strokeWidth={1}
                className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
              />
            )}
          </DebugLayer>
        </svg>

        {/* phase overlays */}
        <AnimatePresence>
          {state.phase !== 'running' && (
            <motion.div
              key={state.phase}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80"
            >
              {state.phase === 'idle' && (
                <PanelButton
                  label={copy.controls.start}
                  onClick={() => dispatch({ type: 'start', t: performance.now() })}
                />
              )}

              {state.phase === 'interstitial' && (
                <>
                  <p className="font-mono text-2xl tabular-nums text-foreground">
                    {fmt(state.round1.totalMs)}
                    {state.round1.capped && (
                      <span className="ml-2 text-sm text-accent">
                        {copy.stages.capped}
                      </span>
                    )}
                  </p>
                  <p className="max-w-[36ch] text-center font-mono text-xs text-muted-foreground">
                    {copy.stages.interstitial}
                  </p>
                  <PanelButton
                    label={copy.controls.continue}
                    onClick={() =>
                      dispatch({ type: 'continue', t: performance.now() })
                    }
                  />
                </>
              )}

              {state.phase === 'results' && (
                <Results
                  round1={state.round1}
                  round2={state.round2}
                  onReset={() => dispatch({ type: 'reset' })}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DemoStage>
  )
}

function PanelButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      whileTap={{ scale: 0.97 }}
      className="rounded-md border border-accent px-5 py-2.5 font-mono text-sm font-medium tracking-widest text-accent transition-colors duration-150 hover:bg-accent/10"
    >
      {label}
    </motion.button>
  )
}

function Results({
  round1,
  round2,
  onReset,
}: {
  round1: RoundResult
  round2: RoundResult
  onReset: () => void
}) {
  const reducedMotion = useReducedMotion()
  const per1 = round1.hits > 0 ? round1.totalMs / round1.hits : 0
  const per2 = round2.hits > 0 ? round2.totalMs / round2.hits : 0
  const delta = Math.max(0, Math.round(per1 - per2))

  const rows = [
    { label: copy.results.total, a: fmt(round1.totalMs), b: fmt(round2.totalMs) },
    {
      label: copy.results.perClick,
      a: `${Math.round(per1)}ms`,
      b: `${Math.round(per2)}ms`,
    },
    { label: copy.results.misses, a: `${round1.misses}`, b: `${round2.misses}` },
  ]

  return (
    <div className="flex flex-col items-center gap-4 px-6">
      <table className="font-mono text-xs tabular-nums">
        <thead>
          <tr className="text-muted-foreground">
            <th />
            <th className="px-4 pb-2 text-right font-normal">
              {copy.results.round1}
              {round1.capped ? ' *' : ''}
            </th>
            <th className="px-4 pb-2 text-right font-normal">
              {copy.results.round2}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.label}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: DUR.base,
                ease: EASE_OUT,
                delay: reducedMotion ? 0 : i * 0.04,
              }}
            >
              <td className="pr-2 text-muted-foreground">{row.label}</td>
              <td className="px-4 text-right text-foreground">{row.a}</td>
              <td className="px-4 text-right text-foreground">{row.b}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <motion.p
        initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: DUR.base,
          ease: EASE_OUT,
          delay: reducedMotion ? 0 : 0.16,
        }}
        className="font-mono text-sm text-accent"
      >
        {copy.results.delta.replace('{delta}', String(delta))}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.base, delay: reducedMotion ? 0 : 0.2 }}
        className="max-w-[44ch] text-center font-mono text-xs text-muted-foreground"
      >
        {copy.results.framing}
      </motion.p>
      <PanelButton label={copy.controls.reset} onClick={onReset} />
    </div>
  )
}
