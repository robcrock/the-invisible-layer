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
      {/* Compact phase bar: pins at the viewport top for the whole phase;
          the next section's bar pushes it out. */}
      <div className="sticky top-0 z-30 border-b border-t border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-x-6 px-6 lg:px-10">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-muted-foreground">
            {phase.number}
          </span>
          <h2
            id={`phase-${phase.id}-title`}
            className="font-sans text-[1.1rem] font-medium leading-none text-foreground"
          >
            {phase.title}
          </h2>
          <p className="ml-auto hidden truncate text-[0.85rem] leading-none text-muted-foreground md:block">
            {phase.summary}
          </p>
        </div>
      </div>

      {phase.demo ? (
        <>
          {/* Mobile: the demo pins directly beneath the phase bar. */}
          <div className="sticky top-14 z-20 border-b border-border bg-background px-4 pb-3 pt-2 md:hidden">
            {Demo ? <Demo stage={stage} /> : <DemoSlot id={phase.demo} />}
          </div>

          <div className="mx-auto max-w-6xl px-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 lg:px-10">
            {/* Narrative beats scroll on the left… */}
            <div className="pb-[10vh] pt-[6vh]">
              {phase.beats.map((beat, i) => (
                <BeatBlock
                  key={beat.id}
                  beat={beat}
                  index={i}
                  onActive={handleActive}
                />
              ))}
            </div>

            {/* …while the phase's demo stays pinned on the right, centered
                in the space below the phase bar. */}
            <div className="hidden md:block">
              <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col justify-center gap-4">
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
        <div className="mx-auto max-w-2xl px-6 pb-[10vh] pt-[6vh]">
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
