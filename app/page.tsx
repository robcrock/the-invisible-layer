import { phases } from '@/lib/content'
import { DeckHeader } from '@/components/deck/deck-header'
import { PhaseSection } from '@/components/deck/phase-section'

export default function Page() {
  return (
    <main>
      <DeckHeader phases={phases} />

      {/* Cover slide — its header is the shared DeckHeader above, which morphs
          into the phase nav as you scroll. The body fills the rest of the
          viewport beneath that 3.5rem bar. */}
      <header id="hero" className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-6 py-14 sm:py-16 lg:px-10 lg:py-20">
          <div className="flex flex-col items-start gap-6 sm:gap-8">
          <div className="h-[5px] w-16 bg-accent" aria-hidden="true" />
          <h1 className="font-sans text-[clamp(2.75rem,9vw,8.25rem)] font-medium leading-[0.92] tracking-[-0.035em] text-foreground">
            The Invisible
            <br />
            Layer
          </h1>
          <p className="max-w-[45ch] text-pretty text-[clamp(1.1rem,1.7vw,1.7rem)] leading-[1.4] tracking-[-0.01em] text-foreground/80">
            The mark you see is not the target you touch. Honest marks keep
            charts truthful; generous invisible hit targets keep them usable.
          </p>
        </div>

        <nav
          aria-label="Talk contents"
          className="grid grid-cols-3 gap-x-8 gap-y-6 border-t border-border pt-6 sm:grid-cols-4 lg:grid-cols-7"
        >
          {phases.map((phase) => (
            <div key={phase.id} className="flex flex-col gap-1.5">
              <span className="font-mono text-xs font-semibold tracking-[0.12em] text-foreground">
                {phase.number}
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {phase.title}
              </span>
            </div>
          ))}
        </nav>
        </div>
      </header>

      {phases.map((phase) => (
        <PhaseSection key={phase.id} phase={phase} />
      ))}

      <footer className="mx-auto max-w-6xl px-6 pb-32 pt-8 lg:px-10">
        <p className="font-mono text-xs text-muted-foreground">
          The Invisible Layer. Fin.
        </p>
      </footer>
    </main>
  )
}
