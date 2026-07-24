'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Phase } from '@/lib/content'

type Step =
  | { kind: 'hero'; label: string; selector: string }
  | { kind: 'beat'; label: string; selector: string }

/**
 * Fixed prev/next control that steps the deck one beat at a time. Step 0 is the
 * hero cover; after that there's a step per beat, labelled `phase.beat`
 * (00.1, 00.2, …) so a single press never skips the sub-points inside a phase.
 * Navigation is native smooth scroll on click (scrollIntoView) — never
 * wheel/scroll hijacking. The active step is read from an IntersectionObserver,
 * not driven by the buttons, so it stays correct when the audience scrolls by
 * hand. Ink/grey only: the stepper is metadata, so it keeps clear of the
 * reserved orange accent.
 */
export function PhaseStepper({ phases }: { phases: Phase[] }) {
  const [active, setActive] = useState(0)

  const steps = useMemo<Step[]>(() => {
    const list: Step[] = [{ kind: 'hero', label: '—', selector: '#hero' }]
    for (const phase of phases) {
      phase.beats.forEach((beat, i) => {
        list.push({
          kind: 'beat',
          label: `${phase.number}.${i + 1}`,
          selector: `[data-beat-id="${beat.id}"]`,
        })
      })
    }
    return list
  }, [phases])

  useEffect(() => {
    const els = steps
      .map((s) => document.querySelector<HTMLElement>(s.selector))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = els.indexOf(entry.target as HTMLElement)
            if (idx !== -1) setActive(idx)
          }
        }
      },
      // Same center band the beats use to highlight, so the counter matches
      // whichever beat is lit.
      { rootMargin: '-40% 0px -40% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [steps])

  const go = (index: number) => {
    const step = steps[index]
    if (!step) return
    const el = document.querySelector<HTMLElement>(step.selector)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      // The hero aligns to the top; a beat centers so it lands in the band
      // that lights it and restages the pinned demo.
      block: step.kind === 'hero' ? 'start' : 'center',
    })
  }

  const atStart = active === 0
  const atEnd = active === steps.length - 1
  const last = phases[phases.length - 1]?.number ?? ''

  return (
    <nav
      aria-label="Beat navigation"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-1 rounded-[var(--radius-md)] border border-border bg-card px-1.5 py-1.5"
    >
      <button
        type="button"
        onClick={() => go(active - 1)}
        disabled={atStart}
        aria-label="Previous beat"
        className="flex h-10 w-full items-center justify-center rounded-[var(--radius-sm)] text-foreground transition-colors hover:bg-accent/10 hover:text-accent disabled:pointer-events-none disabled:opacity-20"
      >
        <Chevron dir="up" />
      </button>
      <span className="w-20 text-center font-mono text-[0.72rem] uppercase tracking-[0.08em] tabular-nums text-muted-foreground">
        {steps[active].label} / {last}
      </span>
      <button
        type="button"
        onClick={() => go(active + 1)}
        disabled={atEnd}
        aria-label="Next beat"
        className="flex h-10 w-full items-center justify-center rounded-[var(--radius-sm)] text-foreground transition-colors hover:bg-accent/10 hover:text-accent disabled:pointer-events-none disabled:opacity-20"
      >
        <Chevron dir="down" />
      </button>
    </nav>
  )
}

function Chevron({ dir }: { dir: 'up' | 'down' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d={dir === 'up' ? 'M2.5 7.5 6 4l3.5 3.5' : 'M2.5 4.5 6 8l3.5-3.5'}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  )
}
