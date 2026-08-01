const LINKS: { label: string; href: string }[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/robertcrocker/' },
  { label: 'X', href: 'https://x.com/robcrock' },
  { label: 'robcrock.com', href: 'https://robcrock.com' },
]

/**
 * The sign-off epilogue after the Outro: a short invitation to connect and the
 * three real links. Bookends the hero's orange tick. Not a nav phase — it sits
 * after the phase list as a closing note you reach by scrolling to the bottom.
 */
export function Connect() {
  return (
    <section
      aria-label="Connect"
      className="mx-auto flex min-h-[70dvh] max-w-6xl flex-col justify-center gap-8 px-6 py-24 lg:px-10"
    >
      <div className="h-[5px] w-16 bg-accent" aria-hidden="true" />

      <div className="max-w-2xl">
        <p className="mb-4 font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Connect
        </p>
        <h2 className="text-balance font-sans text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-foreground">
          Come say hi
        </h2>
        <p className="mt-5 max-w-[46ch] text-pretty text-[1.1rem] leading-[1.55] text-foreground/80">
          I’m Robert Crocker. I care about the usability of digital products. If
          any of this landed, reach out.
        </p>
      </div>

      <ul className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 underline decoration-1 underline-offset-4 transition-colors hover:text-accent"
            >
              {l.label}
              <span
                aria-hidden="true"
                className="text-muted-foreground transition-colors group-hover:text-accent"
              >
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-mono text-xs text-muted-foreground">
        The Invisible Layer. Fin.
      </p>
    </section>
  )
}
