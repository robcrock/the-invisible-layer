'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { DUR, EASE_OUT } from './motion'

// Full-stage panel for armed/results states. Cross-fades when stateKey
// changes. Never shown while a round is running — the chart is the UI then.
export function StageOverlay({
  show,
  stateKey,
  children,
}: {
  show: boolean
  stateKey: string
  children: ReactNode
}) {
  const reducedMotion = useReducedMotion()
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={stateKey}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/90"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// The one primary action visible at a time (START, RESET). stopPropagation
// on pointerdown keeps button presses out of the miss counters.
export function PanelButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      whileTap={{ scale: 0.97 }}
      className="rounded-md bg-accent px-5 py-3 font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-accent-foreground transition-colors duration-150 hover:bg-accent/90"
    >
      {label}
    </motion.button>
  )
}
