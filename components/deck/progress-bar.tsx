'use client'

import { motion, useScroll, useSpring } from 'motion/react'

export function ProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  })

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-border"
      role="progressbar"
      aria-label="Reading progress"
    >
      <motion.div
        className="h-full origin-left bg-accent"
        style={{ scaleX }}
      />
    </div>
  )
}
