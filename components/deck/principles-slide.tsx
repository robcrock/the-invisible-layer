'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import type { Beat } from '@/lib/content'
import { principleCards } from '@/lib/content'
import { PrincipleIllustration } from './principle-illustration'

type PrinciplesSlideProps = {
  heading: Beat
  onActive: (index: number) => void
}

/**
 * The Principles phase as a single slide: a heading over a horizontal triptych
 * of the three takeaway laws. Each card carries its diagram, the named law, the
 * plain-language statement, and the chapter where the audience will measure it.
 * One `data-beat-id` so the deck header tracks it like any beat.
 */
export function PrinciplesSlide({ heading, onActive }: PrinciplesSlideProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const isActive = useInView(ref, { margin: '-40% 0px -40% 0px' })

  useEffect(() => {
    if (isActive) onActive(0)
  }, [isActive, onActive])

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
        <p className="mt-5 max-w-[52ch] text-pretty text-[1.1rem] leading-[1.55] text-foreground/80">
          {heading.body}
        </p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {principleCards.map((card, i) => (
          <motion.div
            key={card.id}
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
            <div className="mb-7 w-full">
              <PrincipleIllustration name={card.illustration} />
            </div>
            <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {card.law}
            </p>
            <h4 className="mt-3 text-balance font-sans text-[1.35rem] font-medium leading-[1.2] tracking-[-0.015em] text-foreground">
              {card.statement}
            </h4>
            <p className="mt-3 text-[0.98rem] leading-[1.5] text-foreground/80">
              {card.note}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
