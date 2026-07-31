'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import type { Beat } from '@/lib/content'

/**
 * The Outro's reprise beat ("How we measure our impact") rendered as its own
 * full-width slide: the heading, then a three-card recap of the techniques
 * that grew the interactive target without changing the mark — each card
 * shows the honest mark size struck through and the target it grew into.
 */

type Technique = {
  chapter: string
  name: string
  markLabel: string
  targetLabel: string
  note: string
}

const TECHNIQUES: Technique[] = [
  {
    chapter: '03 · Fitts Law',
    name: 'Band targets',
    markLabel: '3px bar',
    targetLabel: 'whole column',
    note: 'The bar keeps its honest height. An invisible band the full height of the column takes the click.',
  },
  {
    chapter: '04 · Steering Law',
    name: 'Computed overlay',
    markLabel: '2px line',
    targetLabel: 'every pixel',
    note: 'The line stays one pixel thin. A bisector hands every pixel in the plot to its nearest date.',
  },
  {
    chapter: '05 · Hidden Affordance',
    name: 'Nearest-point cells',
    markLabel: '3px dots',
    targetLabel: 'nearest cell',
    note: 'The dots stay tiny. A Voronoi tessellation gives every pixel one owner.',
  },
]

export function SurfaceAreaCards({
  heading,
  index,
  onActive,
}: {
  heading: Beat
  index: number
  onActive: (index: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const isActive = useInView(ref, { margin: '-40% 0px -40% 0px' })

  useEffect(() => {
    if (isActive) onActive(index)
  }, [isActive, index, onActive])

  return (
    <div
      ref={ref}
      data-beat-id={heading.id}
      className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-6xl flex-col justify-center px-6 py-16 lg:px-10"
    >
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="mb-12 max-w-2xl"
      >
        {heading.kicker && (
          <p className="mb-4 font-mono text-[0.78rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {heading.kicker}
          </p>
        )}
        <h3 className="text-balance font-sans text-[clamp(1.9rem,3vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.025em] text-foreground">
          {heading.title}
        </h3>
        {heading.body && (
          <p className="mt-5 max-w-[52ch] text-pretty text-[1.1rem] leading-[1.55] text-foreground/80">
            {heading.body}
          </p>
        )}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {TECHNIQUES.map((t, i) => (
          <motion.div
            key={t.name}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5% 0px -5% 0px' }}
            transition={{
              duration: 0.5,
              delay: reducedMotion ? 0 : 0.1 + i * 0.1,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="flex flex-col rounded-lg border border-border bg-card p-7"
          >
            <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.chapter}
            </p>
            <div className="mt-5 flex items-baseline gap-3 font-mono text-[0.95rem]">
              <span className="text-muted-foreground line-through">
                {t.markLabel}
              </span>
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
              <span className="text-[1.15rem] font-medium text-accent">
                {t.targetLabel}
              </span>
            </div>
            <h4 className="mt-6 text-balance font-sans text-[1.2rem] font-medium leading-[1.2] tracking-[-0.015em] text-foreground">
              {t.name}
            </h4>
            <p className="mt-3 text-[0.98rem] leading-[1.5] text-foreground/80">
              {t.note}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
