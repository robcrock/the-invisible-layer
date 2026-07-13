'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { VB } from './svg'
import { DUR, EASE_OUT } from './motion'

type ChartTooltipProps = {
  // viewBox coordinates of the SNAPPED point (never the raw cursor)
  x: number
  y: number
  visible: boolean
  children: ReactNode
}

// Anchored to the data, hoverable by the human. Widgets hide it on the
// STAGE BODY's pointerleave — never the overlay's — so the pointer can
// travel from plot into tooltip without a flicker.
export function ChartTooltip({ x, y, visible, children }: ChartTooltipProps) {
  const reducedMotion = useReducedMotion()

  // Percentage anchoring: no measurement, resizes for free.
  const left = (x / VB.w) * 100
  const top = (y / VB.h) * 100
  // Arithmetic edge-flip, no layout reads.
  const alignX = x > VB.w * 0.72 ? '-100%' : x < VB.w * 0.18 ? '0%' : '-50%'
  const flipBelow = y < 70

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transition: reducedMotion
          ? undefined
          : 'left 120ms cubic-bezier(0.21, 0.47, 0.32, 0.98), top 120ms cubic-bezier(0.21, 0.47, 0.32, 0.98)',
      }}
    >
      <div
        className="w-max"
        style={{
          transform: `translate(${alignX}, ${flipBelow ? '10px' : 'calc(-100% - 10px)'})`,
        }}
      >
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
              transition={{ duration: DUR.fast, ease: EASE_OUT }}
              className="pointer-events-auto rounded-md border border-border bg-card px-3 py-2 font-mono text-xs tabular-nums leading-relaxed"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
