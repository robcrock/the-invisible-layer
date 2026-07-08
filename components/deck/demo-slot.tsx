export function DemoSlot({ id, label }: { id: string; label?: string }) {
  return (
    <div
      data-demo-slot={id}
      className="mt-8 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-accent/40 bg-accent/[0.03]"
    >
      <span className="font-mono text-sm text-accent">{id}</span>
      <span className="font-mono text-xs text-muted-foreground">
        {label ?? 'interactive demo mounts here'}
      </span>
    </div>
  )
}
