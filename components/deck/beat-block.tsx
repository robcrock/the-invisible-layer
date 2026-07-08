'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import type { Beat } from '@/lib/content'
import { DemoSlot } from './demo-slot'

type BeatBlockProps = {
  beat: Beat
  index: number
  onActive: (index: number) => void
}

export function BeatBlock({ beat, index, onActive }: BeatBlockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const isActive = useInView(ref, { margin: '-40% 0px -40% 0px' })

  useEffect(() => {
    if (isActive) onActive(index)
  }, [isActive, index, onActive])

  return (
    <div
      ref={ref}
      className="flex min-h-[70vh] items-center"
      data-beat-id={beat.id}
    >
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ margin: '-10% 0px -10% 0px', once: true }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full"
      >
        <motion.div
          animate={{
            opacity: isActive ? 1 : 0.25,
            scale: reducedMotion ? 1 : isActive ? 1 : 0.98,
            filter: reducedMotion
              ? 'blur(0px)'
              : isActive
                ? 'blur(0px)'
                : 'blur(2px)',
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {beat.kicker && (
            <p className="mb-3 font-mono text-xs font-medium tracking-[0.2em] text-accent">
              {beat.kicker}
            </p>
          )}
          <h3 className="text-pretty font-sans text-[1.75rem] font-semibold leading-tight text-foreground">
            {beat.title}
          </h3>
          <p className="mt-4 max-w-[55ch] text-pretty text-[1.05rem] leading-relaxed text-muted-foreground">
            {beat.body}
          </p>
          {beat.demoSlot && <DemoSlot id={beat.demoSlot} />}
        </motion.div>
      </motion.div>
    </div>
  )
}
