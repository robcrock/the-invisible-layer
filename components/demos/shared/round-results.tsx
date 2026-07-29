'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { RoundResult } from './use-round-game'
import { PanelButton } from './stage-overlay'
import { DUR, EASE_OUT } from './motion'

export function fmt(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`
}

export type RoundResultsCopy = {
  round1: string
  round2: string
  total: string
  perHit: string
  misses: string
  wrongHits?: string
  delta: string // template containing {delta}
  framing: string
  reset: string
}

type RowKey = 'total' | 'perHit' | 'misses' | 'wrongHits'

// The measured payoff, identical across every game widget: round 1 vs
// round 2, the per-hit delta, one sentence of framing, reset.
export function RoundResults({
  copy,
  round1,
  round2,
  rows = ['total', 'perHit', 'misses'],
  onReset,
}: {
  copy: RoundResultsCopy
  round1: RoundResult
  round2: RoundResult
  rows?: RowKey[]
  onReset: () => void
}) {
  const reducedMotion = useReducedMotion()
  const per1 = round1.hits > 0 ? round1.totalMs / round1.hits : 0
  const per2 = round2.hits > 0 ? round2.totalMs / round2.hits : 0
  const delta = Math.max(0, Math.round(per1 - per2))

  const cells: Record<RowKey, { label: string; a: string; b: string }> = {
    total: { label: copy.total, a: fmt(round1.totalMs), b: fmt(round2.totalMs) },
    perHit: {
      label: copy.perHit,
      a: `${Math.round(per1)}ms`,
      b: `${Math.round(per2)}ms`,
    },
    misses: { label: copy.misses, a: `${round1.misses}`, b: `${round2.misses}` },
    wrongHits: {
      label: copy.wrongHits ?? 'wrong hits',
      a: `${round1.wrongHits}`,
      b: `${round2.wrongHits}`,
    },
  }

  return (
    <div className="flex flex-col items-center gap-4 px-6">
      <table className="font-mono text-xs tabular-nums">
        <thead>
          <tr className="text-muted-foreground">
            <th />
            <th className="px-4 pb-2 text-right font-normal">
              {copy.round1}
              {round1.capped ? ' *' : ''}
            </th>
            <th className="px-4 pb-2 text-right font-normal">
              {copy.round2}
              {round2.capped ? ' *' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((key, i) => (
            <motion.tr
              key={key}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: DUR.base,
                ease: EASE_OUT,
                delay: reducedMotion ? 0 : i * 0.04,
              }}
            >
              <td className="pr-2 text-muted-foreground">{cells[key].label}</td>
              <td className="px-4 text-right text-foreground">{cells[key].a}</td>
              <td className="px-4 text-right text-foreground">{cells[key].b}</td>
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
        className="font-mono text-xl font-semibold text-accent"
      >
        {copy.delta.replace('{delta}', String(delta))}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.base, delay: reducedMotion ? 0 : 0.2 }}
        className="max-w-[44ch] text-center font-mono text-xs text-muted-foreground"
      >
        {copy.framing}
      </motion.p>
      <PanelButton label={copy.reset} onClick={onReset} />
    </div>
  )
}
