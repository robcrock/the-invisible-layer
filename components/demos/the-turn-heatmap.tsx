'use client'

import { useCallback, useState } from 'react'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL, DEBUG_STROKE } from './shared/debug-toggle'
import { ChartTooltip } from './shared/chart-tooltip'
import { useStageSync } from './shared/use-stage-sync'
import { VB, PLOT } from './shared/svg'
import { makeHeatmap } from './shared/data'

const copy = demoCopy['the-turn-heatmap']

const COLS = 12
const ROWS = 7
const CELLS = makeHeatmap(31, COLS, ROWS)

const CELL_W = PLOT.w / COLS
const CELL_H = PLOT.h / ROWS
const cellX = (c: number) => PLOT.x + c * CELL_W
const cellY = (r: number) => PLOT.y + r * CELL_H

type TurnStage = 'hover' | 'coverage'

// The counterexample: a chart whose marks already fill the space. Every
// pixel answers a hover, and the debug reveal lands exactly on the marks
// — mark area = target area, so the invisible layer has nothing to add.
export function TheTurnHeatmap({ stage }: { stage?: string }) {
  const [debug, setDebug] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const applyStage = useCallback((s: string) => {
    switch (s as TurnStage) {
      case 'hover':
        setDebug(false)
        break
      case 'coverage':
        setDebug(true)
        break
    }
  }, [])
  useStageSync(stage, applyStage)

  const hoveredCell = hovered !== null ? CELLS[hovered] : null

  return (
    <DemoStage
      slotId="the-turn-heatmap"
      controls={<DebugToggle on={debug} onChange={setDebug} />}
      hint={debug ? copy.stages.coverage : copy.hint}
      footer={
        debug ? (
          <span className="text-accent">{copy.results.livePixels}</span>
        ) : (
          <span>
            {copy.results.hovering}{' '}
            <span className="text-foreground">
              {hoveredCell
                ? `${hoveredCell.id} · ${Math.round(hoveredCell.value)}`
                : '—'}
            </span>
          </span>
        )
      }
    >
      <div className="h-full w-full" onPointerLeave={() => setHovered(null)}>
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Heatmap where every cell is its own hover target — mark area equals target area"
        >
          {/* the marks — and, identically, the targets */}
          {CELLS.map((cell, i) => (
            <rect
              key={cell.id}
              x={cellX(cell.col) + 0.5}
              y={cellY(cell.row) + 0.5}
              width={CELL_W - 1}
              height={CELL_H - 1}
              fillOpacity={0.05 + (cell.value / 100) * 0.85}
              onPointerEnter={() => setHovered(i)}
              className="cursor-crosshair fill-foreground"
            />
          ))}

          {/* hovered cell outline — instant, unmistakable */}
          {hoveredCell && (
            <rect
              x={cellX(hoveredCell.col) + 0.5}
              y={cellY(hoveredCell.row) + 0.5}
              width={CELL_W - 1}
              height={CELL_H - 1}
              fill="none"
              strokeWidth={1.5}
              pointerEvents="none"
              className="stroke-foreground"
            />
          )}

          {/* axis labels */}
          {Array.from({ length: COLS }, (_, c) => (
            <text
              key={c}
              x={cellX(c) + CELL_W / 2}
              y={PLOT.y + PLOT.h + 18}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {String.fromCharCode(65 + c)}
            </text>
          ))}
          {Array.from({ length: ROWS }, (_, r) => (
            <text
              key={r}
              x={PLOT.x - 8}
              y={cellY(r) + CELL_H / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {r + 1}
            </text>
          ))}

          {/* The reveal with nothing to reveal: the hit-target layer lands
              exactly on the marks. Zero gap — that's the whole point. */}
          <DebugLayer show={debug}>
            {CELLS.map((cell) => (
              <rect
                key={cell.id}
                x={cellX(cell.col) + 0.5}
                y={cellY(cell.row) + 0.5}
                width={CELL_W - 1}
                height={CELL_H - 1}
                strokeWidth={1}
                className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
              />
            ))}
          </DebugLayer>
        </svg>

        {hoveredCell && (
          <ChartTooltip
            x={cellX(hoveredCell.col) + CELL_W / 2}
            y={cellY(hoveredCell.row) + CELL_H / 2}
            visible
          >
            <span className="text-muted-foreground">{hoveredCell.id}</span>{' '}
            <span className="text-foreground">
              {Math.round(hoveredCell.value)}
            </span>
          </ChartTooltip>
        )}
      </div>
    </DemoStage>
  )
}
