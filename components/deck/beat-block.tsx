'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import type { Beat } from '@/lib/content'

type BeatBlockProps = {
  beat: Beat
  index: number
  onActive: (index: number) => void
}

// Renders the body, turning the first occurrence of `link.text` into an
// anchor. Kept out of the deck's markdown/rich-text scope on purpose: one
// optional inline link is all any beat needs.
function renderBody(body: string, link?: Beat['link']) {
  if (!link) return body
  const at = body.indexOf(link.text)
  if (at === -1) return body
  return (
    <>
      {body.slice(0, at)}
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-1 underline-offset-2 transition-colors hover:text-accent"
      >
        {link.text}
      </a>
      {body.slice(at + link.text.length)}
    </>
  )
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
      className="flex min-h-[80dvh] items-center md:min-h-[85dvh]"
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
            <p className="mb-5 font-mono text-[0.78rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {beat.kicker}
            </p>
          )}
          <h3 className="text-balance font-sans text-[clamp(2rem,3.2vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.025em] text-foreground">
            {beat.title}
          </h3>
          <p className="mt-6 max-w-[40ch] text-pretty text-[1.2rem] leading-[1.6] text-foreground/80">
            {renderBody(beat.body, beat.link)}
          </p>
          {beat.code && (
            <pre className="mt-6 w-full max-w-[56ch] overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-card px-5 py-3.5 font-mono text-[0.8rem] leading-[1.7] text-foreground">
              <code>{beat.code}</code>
            </pre>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
