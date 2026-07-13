import { phases } from '@/lib/content'
import { ProgressBar } from '@/components/deck/progress-bar'
import { PhaseSection } from '@/components/deck/phase-section'

export default function Page() {
  return (
    <main>
      <ProgressBar />

      <header className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-muted-foreground">
          A talk on interaction design in data visualization
        </p>
        <h1 className="mt-6 text-balance font-sans text-[clamp(2.5rem,4.5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
          The Invisible Layer
        </h1>
        <p className="mt-5 max-w-[48ch] text-pretty text-base leading-[1.55] text-muted-foreground">
          Honest marks, generous targets — and the transparent geometry in
          between.
        </p>
        <p
          className="mt-16 font-mono text-[0.72rem] text-muted-foreground"
          aria-hidden="true"
        >
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
