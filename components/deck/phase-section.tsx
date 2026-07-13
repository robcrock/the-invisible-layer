'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Phase } from '@/lib/content'
import { demoRegistry } from '@/components/demos'
import { BeatBlock } from './beat-block'
import { DemoSlot } from './demo-slot'

export function PhaseSection({ phase }: { phase: Phase }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleActive = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Stage = last defined demoStage at or before the active beat, so pure
  // narration beats never blank the demo and scrolling up re-derives it.
  const stage = useMemo(() => {
    for (let i = Math.min(activeIndex, phase.beats.length - 1); i >= 0; i--) {
      const s = phase.beats[i].demoStage
      if (s) return s
    }
    return undefined
  }, [activeIndex, phase.beats])

  const Demo = phase.demo ? demoRegistry[phase.demo] : undefined

  return (
    <section className="relative" aria-labelledby={`phase-${phase.id}-title`}>
      <PhaseHeader phase={phase} />

      {phase.demo ? (
        <>
          {/* Mobile: the demo pins at the top; beats scroll beneath it. */}
          <div className="sticky top-0 z-20 border-b border-border bg-background px-4 pb-3 pt-2 md:hidden">
            <p className="mb-2 font-mono text-xs tracking-[0.2em] text-accent">
              {phase.number} · {phase.title}
            </p>
            {Demo ? <Demo stage={stage} /> : <DemoSlot id={phase.demo} />}
          </div>

          <div className="mx-auto max-w-6xl px-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 lg:px-10">
            {/* Narrative beats scroll on the left… */}
            <div className="py-[10vh]">
              {phase.beats.map((beat, i) => (
                <BeatBlock
                  key={beat.id}
                  beat={beat}
                  index={i}
                  onActive={handleActive}
                />
              ))}
            </div>

            {/* …while the phase's demo stays pinned on the right. */}
            <div className="hidden md:block">
              <div className="sticky top-0 flex h-screen flex-col justify-center gap-4">
                {Demo ? <Demo stage={stage} /> : <DemoSlot id={phase.demo} />}

                {/* Beat rail */}
                <div className="flex items-center gap-2" aria-hidden="true">
                  {phase.beats.map((beat, i) => (
                    <span
                      key={beat.id}
                      className={`h-1.5 w-1.5 transition-colors duration-300 ${
                        i === activeIndex
                          ? 'bg-accent'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Prose phases (no pinned demo): a single centered column. */
        <div className="mx-auto max-w-2xl px-6 py-[10vh]">
          {phase.beats.map((beat, i) => (
            <BeatBlock
              key={beat.id}
              beat={beat}
              index={i}
              onActive={handleActive}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function PhaseHeader({ phase }: { phase: Phase }) {
  return (
    <div className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-24 lg:px-10">
        <p className="font-mono text-sm tracking-[0.25em] text-accent">
          {phase.number}
        </p>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2
            id={`phase-${phase.id}-title`}
            className="text-balance font-sans text-3xl font-bold leading-tight text-foreground md:text-4xl"
          >
            {phase.title}
          </h2>
          <p className="max-w-[44ch] text-pretty text-base leading-relaxed text-muted-foreground">
            {phase.summary}
          </p>
        </div>
      </div>
    </div>
  )
}
