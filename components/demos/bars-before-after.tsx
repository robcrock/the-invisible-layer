'use client'

import { useState } from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { demoCopy } from '@/lib/content'
import { DemoStage } from './shared/demo-stage'
import { DebugToggle, DebugLayer, DEBUG_FILL, DEBUG_STROKE } from './shared/debug-toggle'
import { SegmentedControl } from './shared/segmented-control'
import { ChartTooltip } from './shared/chart-tooltip'
import { VB, PLOT } from './shared/svg'
import { BAR_DATA } from './shared/data'

const copy = demoCopy['bars-before-after']

const xScale = scaleBand()
  .domain(BAR_DATA.map((d) => d.label))
  .range([PLOT.x, PLOT.x + PLOT.w])
  .padding(0.25)
const yScale = scaleLinear().domain([0, 100]).range([PLOT.y + PLOT.h, PLOT.y])

const step = xScale.step()
// Full scaleBand step, padding included — the category owns the whole column.
const bandX = (label: string) => (xScale(label) ?? 0) - (step * xScale.paddingInner()) / 2

type Mode = 'mark' | 'band'

// Before/after at its simplest: target the category, not the rectangle.
export function BarsBeforeAfter() {
  const [mode, setMode] = useState<Mode>('mark')
  const [debug, setDebug] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const hoveredBar = hovered !== null ? BAR_DATA[hovered] : null

  return (
    <DemoStage
      slotId="bars-before-after"
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
      hint={copy.hint}
    >
      <div className="h-full w-full" onPointerLeave={() => setHovered(null)}>
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-full w-full"
          role="img"
          aria-label="Bar chart comparing drawn-rectangle targets with full-column band targets"
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
          {BAR_DATA.map((d, i) => (
            <rect
              key={d.label}
              x={xScale(d.label)}
              y={yScale(d.value)}
              width={xScale.bandwidth()}
              height={PLOT.y + PLOT.h - yScale(d.value)}
              pointerEvents={mode === 'band' ? 'none' : undefined}
              onPointerEnter={mode === 'mark' ? () => setHovered(i) : undefined}
              onPointerLeave={mode === 'mark' ? () => setHovered(null) : undefined}
              className={`transition-colors duration-150 ${
                hovered === i ? 'fill-foreground/90' : 'fill-foreground/25'
              } ${mode === 'mark' ? 'cursor-crosshair' : ''}`}
            />
          ))}

          {BAR_DATA.map((d) => (
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

          {/* The invisible layer. SVG gotcha: fill="none" swallows pointer
              events — an invisible rect must use fill="transparent" (or
              pointerEvents="all") to stay hittable. */}
          {mode === 'band' &&
            BAR_DATA.map((d, i) => (
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

          <DebugLayer show={debug}>
            {mode === 'mark'
              ? // the gasp: how little of the column is actually live
                BAR_DATA.map((d) => (
                  <rect
                    key={d.label}
                    x={xScale(d.label)}
                    y={yScale(d.value)}
                    width={xScale.bandwidth()}
                    height={PLOT.y + PLOT.h - yScale(d.value)}
                    strokeWidth={1}
                    className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
                  />
                ))
              : // same treatment, ~100× the area; 1px gaps keep the
                // targets reading as discrete
                BAR_DATA.map((d) => (
                  <rect
                    key={d.label}
                    x={bandX(d.label) + 0.5}
                    y={PLOT.y}
                    width={step - 1}
                    height={PLOT.h}
                    strokeWidth={1}
                    className={`${DEBUG_FILL} ${DEBUG_STROKE}`}
                  />
                ))}
          </DebugLayer>
        </svg>

        {hoveredBar && (
          <ChartTooltip
            x={(xScale(hoveredBar.label) ?? 0) + xScale.bandwidth() / 2}
            y={yScale(hoveredBar.value)}
            visible
          >
            <span className="text-muted-foreground">{hoveredBar.label}</span>{' '}
            <span className="text-foreground">{hoveredBar.value}</span>
          </ChartTooltip>
        )}
      </div>
    </DemoStage>
  )
}
