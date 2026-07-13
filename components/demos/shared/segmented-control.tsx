'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { DUR, EASE_OUT } from './motion'

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

// The presenter's stage stepper (MARK|BAND, TRACE|COMPUTED, NAIVE|NEAREST|CLAMP).
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const uid = useId()
  const reducedMotion = useReducedMotion()

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex items-center rounded-md border border-border p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            whileTap={{ scale: 0.97 }}
            className="relative rounded-[1px] px-2.5 py-1 font-mono text-[0.72rem] font-medium uppercase tracking-[0.08em]"
          >
            {active && (
              <motion.span
                layoutId={`${uid}-active`}
                className="absolute inset-0 rounded-[1px] bg-foreground/10"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: DUR.base, ease: EASE_OUT }
                }
              />
            )}
            <span
              className={cn(
                'relative transition-colors duration-150',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {option.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
