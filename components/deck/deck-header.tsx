'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Phase } from '@/lib/content'

type Step =
  | { kind: 'hero'; selector: string }
  | {
      kind: 'beat'
      selector: string
      phaseIndex: number
      beatIndex: number
    }

/**
 * The single top bar that spans the whole deck. It starts as the hero cover's
 * header — the talk kicker and the `— / NN` phase counter, borderless so it
 * melts into the page — then, as the reader scrolls into the talk, it morphs in
 * place: the hairline fades in, the left cluster crossfades from the kicker to
 * the phase tick-rail + `NN / Title`, and the counter fades out. One
 * element, so the cover header and the phase nav are the same object rather
 * than a handoff between two.
 *
 * On the right sits a persistent prev/next control — the old numeric stepper,
 * horizontalised and stripped of its counter now that the tick-rail segments
 * carry position. Navigation is native smooth scroll (scrollIntoView); the
 * active step is read from a single IntersectionObserver over the hero
 * sentinel and every beat, so the bar stays correct whether the audience
 * scrolls by hand or steps with the buttons.
 */
export function DeckHeader({ phases }: { phases: Phase[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [edges, setEdges] = useState({ atStart: true, atEnd: false })

  const steps = useMemo<Step[]>(() => {
    const list: Step[] = [{ kind: 'hero', selector: '#hero' }]
    phases.forEach((phase, phaseIndex) =>
      phase.beats.forEach((beat, beatIndex) =>
        list.push({
          kind: 'beat',
          selector: `[data-beat-id="${beat.id}"]`,
          phaseIndex,
          beatIndex,
        }),
      ),
    )
    return list
  }, [phases])

  useEffect(() => {
    const indexFor = new Map<Element, number>()
    const els: Element[] = []
    steps.forEach((step, i) => {
      const el = document.querySelector(step.selector)
      if (el) {
        indexFor.set(el, i)
        els.push(el)
      }
    })

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = indexFor.get(entry.target)
            if (i !== undefined) setActiveIdx(i)
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [steps])

  // Prev/next enablement tracks the scroll edges, not the active step index.
  // The last beat's tall block flips "active" long before its content is
  // centered, so gating Next on the index would disable it while the closing
  // slide is only half-revealed and there's no next step to advance to —
  // stranding the reader. Gating on the page edges keeps Next live until the
  // deck is genuinely at the bottom.
  useEffect(() => {
    const update = () => {
      const de = document.documentElement
      setEdges({
        atStart: window.scrollY <= 2,
        atEnd: window.innerHeight + window.scrollY >= de.scrollHeight - 2,
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const go = (index: number) => {
    const step = steps[index]
    if (!step) return
    const el = document.querySelector<HTMLElement>(step.selector)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: step.kind === 'hero' ? 'start' : 'center',
    })
  }

  const cur = steps[activeIdx]
  const atHero = cur.kind === 'hero'
  const phaseIndex = cur.kind === 'beat' ? cur.phaseIndex : 0
  const beatIndex = cur.kind === 'beat' ? cur.beatIndex : 0
  const phase = phases[phaseIndex]
  const lastIdx = steps.length - 1
  const atStart = edges.atStart
  const atEnd = edges.atEnd
  const goPrev = () => go(Math.max(activeIdx - 1, 0))
  const goNext = () => go(Math.min(activeIdx + 1, lastIdx))

  return (
    <div
      className={`sticky top-0 z-40 h-14 border-b bg-background transition-colors duration-500 ${
        atHero ? 'border-transparent' : 'border-border'
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center px-6 lg:px-10">
        {/* Morphing region: cover header ↔ phase nav */}
        <div className="relative h-full flex-1">
          {/* Cover state */}
          <div
            aria-hidden={!atHero}
            className={`absolute inset-0 flex items-center justify-between gap-6 pr-4 transition-opacity duration-500 ${
              atHero ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
              A talk on interaction design in data visualization
            </p>
            <p className="shrink-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
              {`— / ${phases[phases.length - 1].number}`}
            </p>
          </div>

          {/* Phase state */}
          <div
            aria-hidden={atHero}
            className={`absolute inset-0 flex items-center gap-x-5 pr-4 transition-opacity duration-500 ${
              atHero ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            <div
              className="hidden shrink-0 items-center gap-1.5 md:flex"
              aria-hidden="true"
            >
              {phases.map((p, i) => (
                <div key={p.id} className="flex w-7 gap-[1.5px]">
                  {i === phaseIndex ? (
                    p.beats.map((beat, j) => (
                      <span
                        key={beat.id}
                        className={`h-[3px] flex-1 transition-colors duration-300 ${
                          j <= beatIndex ? 'bg-accent' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))
                  ) : (
                    <span
                      className={`h-[3px] w-full transition-colors duration-300 ${
                        i < phaseIndex ? 'bg-accent' : 'bg-muted-foreground/30'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {phase.number} <span className="text-muted-foreground/50">/</span>{' '}
              <span className="text-foreground">{phase.title}</span>
            </p>
          </div>
        </div>

        {/* Persistent prev/next — compare styles */}
        <div className="shrink-0 pl-1">
          <div className="flex items-center">
            <StepButton
              dir="prev"
              onClick={goPrev}
              disabled={atStart}
              className="h-8 w-8 rounded-[var(--radius-sm)]"
            />
            <span className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
            <StepButton
              dir="next"
              onClick={goNext}
              disabled={atEnd}
              className="h-8 w-8 rounded-[var(--radius-sm)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepButton({
  dir,
  onClick,
  disabled,
  className = '',
  long = false,
}: {
  dir: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
  className?: string
  long?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous beat' : 'Next beat'}
      className={`flex items-center justify-center text-foreground transition-colors hover:bg-accent/10 hover:text-accent disabled:pointer-events-none disabled:opacity-20 ${className}`}
    >
      <StepIcon dir={dir} long={long} />
    </button>
  )
}

function StepIcon({ dir, long }: { dir: 'prev' | 'next'; long: boolean }) {
  const chevron =
    dir === 'prev' ? 'M7.5 2.5 4 6l3.5 3.5' : 'M4.5 2.5 8 6l-3.5 3.5'
  const arrow =
    dir === 'prev'
      ? 'M9.5 6H2.5M2.5 6l3-3M2.5 6l3 3'
      : 'M2.5 6h7M9.5 6l-3-3M9.5 6l-3 3'
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d={long ? arrow : chevron}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  )
}
