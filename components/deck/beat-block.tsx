'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import type { Beat } from '@/lib/content'

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
      className="flex min-h-[80vh] items-center md:min-h-[85vh]"
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
          animate={{ opacity: isActive ? 1 : 0.3 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {beat.kicker && (
            <p className="mb-3 font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {beat.kicker}
            </p>
          )}
          <h3 className="text-pretty font-sans text-[1.35rem] font-medium leading-tight text-foreground">
            {beat.title}
          </h3>
          <p className="mt-4 max-w-[55ch] text-pretty text-[0.95rem] leading-[1.55] text-muted-foreground">
            {beat.body}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
