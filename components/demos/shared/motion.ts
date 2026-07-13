// Deck-wide animation constants. Matches the easing already used by
// BeatBlock; every widget interaction stays under 300ms.
export const EASE_OUT = [0.21, 0.47, 0.32, 0.98] as const

export const DUR = {
  fast: 0.15,
  base: 0.2,
  reveal: 0.25,
} as const
