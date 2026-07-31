'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Phase } from '@/lib/content'
import { demoRegistry } from '@/components/demos'
import { BeatBlock } from './beat-block'
import { DemoSlot } from './demo-slot'
import { PrinciplesSlide } from './principles-slide'
import { SurfaceAreaCards } from './surface-area-cards'

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
    <section
      id={`phase-${phase.id}`}
      className="relative"
      aria-label={`${phase.number} — ${phase.title}`}
    >
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
              <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col justify-center">
                {Demo ? <Demo stage={stage} /> : <DemoSlot id={phase.demo} />}
              </div>
            </div>
          </div>
        </>
      ) : phase.id === 'principles' ? (
        /* The takeaway laws as a single slide: heading + card triptych. */
        <PrinciplesSlide heading={phase.beats[0]} onActive={handleActive} />
      ) : phase.id === 'close' ? (
        /* Outro: the reprise beat renders as a full-width card slide (the
           three surface-area techniques), then the remaining beats as prose. */
        <>
          <SurfaceAreaCards
            heading={phase.beats[0]}
            index={0}
            onActive={handleActive}
          />
          <div className="mx-auto max-w-2xl px-6 pb-[10vh]">
            {phase.beats.slice(1).map((beat, i) => (
              <BeatBlock
                key={beat.id}
                beat={beat}
                index={i + 1}
                onActive={handleActive}
              />
            ))}
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
