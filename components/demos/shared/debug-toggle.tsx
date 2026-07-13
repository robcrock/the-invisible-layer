'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Crosshair } from 'lucide-react'
import { cn } from '@/lib/utils'
import { demoCopy } from '@/lib/content'
import { DUR, EASE_OUT } from './motion'

type DebugToggleProps = {
  on: boolean
  onChange: (on: boolean) => void
  label?: string
}

// The signature motif: one toggle, identical everywhere, that reveals the
// invisible hit-target layer in hot pink.
export function DebugToggle({ on, onChange, label }: DebugToggleProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] transition-colors duration-150',
        on
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      <Crosshair className="h-3 w-3" aria-hidden />
      {label ?? demoCopy.shared.debugLabel}
    </motion.button>
  )
}

// Every debug overlay mounts through this wrapper so the treatment can't
// drift between widgets: pink fill/stroke via the accent token, an opacity
// fade, and — critically — pointerEvents="none". The overlay shows the
// layer; it must never BE the layer.
export function DebugLayer({
  show,
  children,
}: {
  show: boolean
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
          pointerEvents="none"
        >
          {children}
        </motion.g>
      )}
    </AnimatePresence>
  )
}

// Shared pink treatment for debug shapes (rects, circles, cells).
export const DEBUG_FILL = 'fill-accent/15'
export const DEBUG_STROKE = 'stroke-accent/60'
