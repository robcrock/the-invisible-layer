import type { ReactNode } from 'react'

type DemoStageProps = {
  slotId: string
  controls?: ReactNode
  hint?: string
  footer?: ReactNode
  children: ReactNode
}

// The chrome every widget shares: slot-id label (the LAB-specimen identity),
// presenter controls, a relative 16:9 body for the SVG + tooltip, and a
// mono instrumentation footer.
export function DemoStage({
  slotId,
  controls,
  hint,
  footer,
  children,
}: DemoStageProps) {
  return (
    <div
      data-demo-slot={slotId}
      className="mt-8 w-full overflow-hidden rounded-md border border-border bg-card/40"
    >
      <div className="flex min-h-[2.5rem] flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-border px-3 py-1.5">
        <span className="font-mono text-xs text-accent">{slotId}</span>
        {controls && <div className="flex items-center gap-2">{controls}</div>}
      </div>
      <div className="relative aspect-video w-full select-none">{children}</div>
      {(hint || footer) && (
        <div className="flex min-h-[2rem] flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border px-3 py-1.5">
          {hint && (
            <span className="font-mono text-xs text-muted-foreground">
              {hint}
            </span>
          )}
          {footer && (
            <div className="ml-auto flex items-center gap-4 font-mono text-xs tabular-nums text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
