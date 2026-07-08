'use client'

import { useCallback, useState } from 'react'
import type { Phase } from '@/lib/content'
import { BeatBlock } from './beat-block'

export function PhaseSection({ phase }: { phase: Phase }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleActive = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  return (
    <section className="relative" aria-labelledby={`phase-${phase.id}-title`}>
      {/* Mobile sticky bar */}
      <div className="sticky top-0.5 z-20 border-b border-border bg-background/90 px-6 py-3 backdrop-blur-sm md:hidden">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent">{phase.number}</span>
          <span className="font-sans text-sm font-semibold text-foreground">
            {phase.title}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 lg:px-10">
        {/* Desktop sticky panel */}
        <div className="hidden md:block">
          <div className="sticky top-0.5 flex min-h-screen flex-col justify-center py-24">
            <p className="font-mono text-sm tracking-[0.25em] text-accent">
              {phase.number}
            </p>
            <h2
              id={`phase-${phase.id}-title`}
              className="mt-4 text-balance font-sans text-[clamp(3rem,4.5vw,5rem)] font-bold leading-[1.05] text-foreground"
            >
              {phase.title}
            </h2>
            <p className="mt-5 max-w-[36ch] text-pretty text-base leading-relaxed text-muted-foreground">
              {phase.summary}
            </p>

            {/* Beat dot indicator */}
            <div className="mt-12 flex flex-col gap-4" aria-hidden="true">
              {phase.beats.map((beat, i) => {
                const active = i === activeIndex
                return (
                  <div key={beat.id} className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-300 ${
                        active ? 'bg-accent' : 'border border-muted-foreground/40'
                      }`}
                    />
                    <span
                      className={`font-mono text-xs transition-opacity duration-300 ${
                        active
                          ? 'text-foreground opacity-100'
                          : 'text-muted-foreground opacity-0'
                      }`}
                    >
                      {beat.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Beats column */}
        <div className="py-[20vh]">
          {phase.beats.map((beat, i) => (
            <BeatBlock
              key={beat.id}
              beat={beat}
              index={i}
              onActive={handleActive}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
