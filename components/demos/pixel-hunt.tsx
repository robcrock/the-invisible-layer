'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { line as d3line } from 'd3-shape'
import { bisector } from 'd3-array'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer } from './shared/debug-toggle'
import { ChartTooltip } from './shared/chart-tooltip'
import { StageOverlay, PanelButton } from './shared/stage-overlay'
import { useStageSync } from './shared/use-stage-sync'
import { VB, PLOT, toViewBox } from './shared/svg'
import { makeSeries, type SeriesPoint } from './shared/data'

const copy = demoCopy['cold-open-pixel-hunt']

const DATA = makeSeries(7, 120)
const MARKED_INDEX = 78 // sits in a wiggly region on purpose
const HOLD_MS = 500 // catch-and-hold, so a lucky drive-by doesn't count

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

type HuntPhase = 'idle' | 'hunting' | 'done'
type HuntResult = { value: number; totalMs: number; onPathMs: number; drops: number }
type ColdOpenStage = 'hunt' | 'honest' | 'reveal'

// The cold open, now a legible challenge: press start, catch the marked
// date on the ~2px stroke, get your misery quantified. The stroke is the
// ONLY pointer target — fill="none" means default `visiblePainted`
// hit-testing sees nothing but the line. That's the demo.
export function PixelHunt({ stage }: { stage?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  const [phase, setPhase] = useState<HuntPhase>('idle')
  const [result, setResult] = useState<HuntResult | null>(null)
  const [showReadout, setShowReadout] = useState(true)
  const [snapped, setSnapped] = useState<(typeof PTS)[number] | null>(null)
  const [debug, setDebug] = useState(false)

  // Hunt instrumentation: total time hunting vs time actually on the
  // stroke, plus every tooltip death. Timestamps live in refs.
  const [display, setDisplay] = useState({ totalMs: 0, onPathMs: 0 })
  const totalAccum = useRef(0)
  const totalSince = useRef<number | null>(null)
  const pathAccum = useRef(0)
  const pathSince = useRef<number | null>(null)
  const drops = useRef(0)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const applyStage = useCallback((s: string) => {
    switch (s as ColdOpenStage) {
      case 'hunt':
        // Never re-idles a finished hunt — the numbers were earned.
        setShowReadout(true)
        setDebug(false)
        break
      case 'honest':
        setShowReadout(false)
        setDebug(false)
        break
      case 'reveal':
        setShowReadout(false)
        setDebug(true)
        break
    }
  }, [])
  useStageSync(stage, applyStage)

  useEffect(() => {
    if (phase !== 'hunting') return
    let raf = 0
    const tick = () => {
      const now = performance.now()
      setDisplay({
        totalMs:
          totalAccum.current +
          (totalSince.current !== null ? now - totalSince.current : 0),
        onPathMs:
          pathAccum.current +
          (pathSince.current !== null ? now - pathSince.current : 0),
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  const finish = useCallback(() => {
    if (phaseRef.current !== 'hunting') return
    const now = performance.now()
    if (totalSince.current !== null) totalAccum.current += now - totalSince.current
    totalSince.current = null
    if (pathSince.current !== null) pathAccum.current += now - pathSince.current
    pathSince.current = null
    const totalMs = totalAccum.current
    const onPathMs = pathAccum.current
    setDisplay({ totalMs, onPathMs })
    setResult({
      value: PTS[MARKED_INDEX].y,
      totalMs,
      onPathMs,
      drops: drops.current,
    })
    setPhase('done')
    setShowReadout(true)
  }, [])

  // Success by holding: snapped to the marked date for HOLD_MS.
  useEffect(() => {
    if (phase !== 'hunting' || snapped?.x !== MARKED_INDEX) return
    const id = setTimeout(finish, HOLD_MS)
    return () => clearTimeout(id)
  }, [phase, snapped, finish])

  const start = () => {
    totalAccum.current = 0
    totalSince.current = performance.now() // clock starts on the click
    pathAccum.current = 0
    pathSince.current = null
    drops.current = 0
    setDisplay({ totalMs: 0, onPathMs: 0 })
    setResult(null)
    setPhase('hunting')
    setShowReadout(true)
  }

  const snapToPointer = (e: React.PointerEvent) => {
    if (!svgRef.current) return null
    const { x } = toViewBox(e, svgRef.current)
    const i = Math.max(0, Math.min(PTS.length - 1, bisectPx(PTS, x)))
    setSnapped(PTS[i])
    return i
  }

  const marked = PTS[MARKED_INDEX]
  const onPct =
    display.totalMs > 0
      ? Math.round((display.onPathMs / display.totalMs) * 100)
      : 0

  const gridY = useMemo(() => [25, 50, 75].map((v) => yScale(v)), [])

  return (
    <DemoStage
      slotId="cold-open-pixel-hunt"
      controls={<DebugToggle on={debug} onChange={setDebug} />}
      hint={copy.hint}
      footer={
        phase === 'idle' ? (
          <span>
            {copy.results.target} #{String(MARKED_INDEX).padStart(3, '0')}
          </span>
        ) : (
          <>
            {phase === 'done' && result && (
              <span className="text-accent">
                {copy.results.value.replace('{value}', result.value.toFixed(1))}
              </span>
            )}
            <span>
              {copy.results.hunting} {(display.totalMs / 1000).toFixed(1)}s
            </span>
            <span className={onPct < 20 ? 'text-accent' : undefined}>
              {copy.results.onTarget} {onPct}%
            </span>
          </>
        )
      }
    >
      <div
        className="h-full w-full"
        onPointerEnter={() => {
          if (phaseRef.current === 'hunting') totalSince.current = performance.now()
        }}
        onPointerLeave={() => {
          const now = performance.now()
          if (totalSince.current !== null)
            totalAccum.current += now - totalSince.current
          totalSince.current = null
          if (pathSince.current !== null) {
            pathAccum.current += now - pathSince.current
            pathSince.current = null
          }
          setSnapped(null)
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Dense line chart with a deliberately tiny hover target"
        >
          {/* faint grid */}
          {gridY.map((y) => (
            <line
              key={y}
              x1={PLOT.x}
              x2={PLOT.x + PLOT.w}
              y1={y}
              y2={y}
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

          {/* the marked date the audience is asked to read */}
          <line
            x1={marked.px}
            x2={marked.px}
            y1={PLOT.y + PLOT.h}
            y2={PLOT.y + PLOT.h + 6}
            className="stroke-accent"
            strokeWidth={2}
          />
          <text
            x={marked.px}
            y={PLOT.y + PLOT.h + 18}
            textAnchor="middle"
            className="fill-accent font-mono text-[10px]"
          >
            #{String(MARKED_INDEX).padStart(3, '0')}
          </text>

          {/* The chart. This path is the entire hit-target layer. */}
          <path
            d={PATH_D}
            fill="none"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            className="cursor-crosshair stroke-foreground/80"
            onPointerMove={snapToPointer}
            onPointerDown={(e) => {
              const i = snapToPointer(e)
              // Clicking while snapped to the marked date also counts —
              // a 500ms hold on a 2px stroke can read as "nothing happened".
              if (i === MARKED_INDEX) finish()
            }}
            onPointerEnter={(e) => {
              if (phaseRef.current === 'hunting')
                pathSince.current = performance.now()
              snapToPointer(e)
            }}
            onPointerLeave={() => {
              if (pathSince.current !== null) {
                pathAccum.current += performance.now() - pathSince.current
                pathSince.current = null
              }
              if (phaseRef.current === 'hunting') drops.current += 1
              // The tooltip dies the instant you slip off the stroke.
              // The flicker is the demo.
              setSnapped(null)
            }}
          />

          <DebugLayer show={debug}>
            {/* the target, revealed: it IS the mark */}
            <path
              d={PATH_D}
              fill="none"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              className="stroke-accent"
            />
            {/* deadpan measurement callout at the marked date */}
            <line
              x1={marked.px + 4}
              y1={marked.py - 4}
              x2={marked.px + 36}
              y2={marked.py - 28}
              className="stroke-accent/60"
              strokeWidth={1}
            />
            <text
              x={marked.px + 40}
              y={marked.py - 32}
              className="fill-accent font-mono text-[10px]"
            >
              {copy.stages.callout}
            </text>
          </DebugLayer>
        </svg>

        {snapped && phase !== 'idle' && (
          <ChartTooltip x={snapped.px} y={snapped.py} visible>
            <span className="text-muted-foreground">
              #{String(snapped.x).padStart(3, '0')}
            </span>{' '}
            <span className="text-foreground">{snapped.y.toFixed(1)}</span>
          </ChartTooltip>
        )}

        <StageOverlay
          show={phase === 'idle' || (phase === 'done' && showReadout)}
          stateKey={phase}
        >
          {phase === 'idle' && (
            <>
              <p className="max-w-[38ch] text-center font-mono text-xs text-muted-foreground">
                {copy.stages.goal}
              </p>
              <PanelButton label={copy.controls.start} onClick={start} />
            </>
          )}

          {phase === 'done' && result && (
            <>
              <p className="font-mono text-2xl tabular-nums text-accent">
                {copy.results.value.replace('{value}', result.value.toFixed(1))}
              </p>
              <table className="font-mono text-xs tabular-nums">
                <tbody>
                  <tr>
                    <td className="pr-2 text-muted-foreground">
                      {copy.results.hunting}
                    </td>
                    <td className="px-4 text-right text-foreground">
                      {(result.totalMs / 1000).toFixed(1)}s
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-2 text-muted-foreground">
                      {copy.results.onTarget}
                    </td>
                    <td className="px-4 text-right text-foreground">
                      {result.totalMs > 0
                        ? Math.round((result.onPathMs / result.totalMs) * 100)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-2 text-muted-foreground">
                      {copy.results.drops}
                    </td>
                    <td className="px-4 text-right text-foreground">
                      {result.drops}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="max-w-[40ch] text-center font-mono text-xs text-muted-foreground">
                {copy.results.framing
                  .replace('{time}', (result.totalMs / 1000).toFixed(1))
                  .replace(
                    '{pct}',
                    String(
                      result.totalMs > 0
                        ? Math.round((result.onPathMs / result.totalMs) * 100)
                        : 0,
                    ),
                  )}
              </p>
              <PanelButton label={copy.controls.retry} onClick={start} />
            </>
          )}
        </StageOverlay>
      </div>
    </DemoStage>
  )
}
