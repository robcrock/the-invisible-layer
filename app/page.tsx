import { phases } from '@/lib/content'
import { ProgressBar } from '@/components/deck/progress-bar'
import { PhaseSection } from '@/components/deck/phase-section'

export default function Page() {
  return (
    <main>
      <ProgressBar />

      <header className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-accent">
          A TALK ON INTERACTION DESIGN IN DATA VISUALIZATION
        </p>
        <h1 className="mt-6 text-balance font-sans text-[clamp(3rem,7vw,6rem)] font-bold leading-[1.02] text-foreground">
          The Invisible Layer
        </h1>
        <p className="mt-6 max-w-[45ch] text-pretty text-lg leading-relaxed text-muted-foreground">
          Honest marks, generous targets — and the transparent geometry in
          between.
        </p>
        <p className="mt-16 font-mono text-xs text-muted-foreground" aria-hidden="true">
          {'scroll ↓'}
        </p>
      </header>

      {phases.map((phase) => (
        <PhaseSection key={phase.id} phase={phase} />
      ))}

      <footer className="mx-auto max-w-6xl px-6 pb-32 pt-8 lg:px-10">
        <p className="font-mono text-xs text-muted-foreground">
          The Invisible Layer — fin.
        </p>
      </footer>
    </main>
  )
}
