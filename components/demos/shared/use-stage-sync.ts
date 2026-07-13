'use client'

import { useEffect, useRef } from 'react'

// Applies a scroll-driven stage exactly once per CHANGE of stage value.
// Manual overrides (segmented controls, debug toggle, sliders) persist
// through scroll jitter within a beat — re-entering the same beat re-derives
// the same stage, which is a no-op. Only a NEW stage from scroll wins over
// a manual override. `apply` must be referentially stable (useCallback).
export function useStageSync(
  stage: string | undefined,
  apply: (stage: string) => void,
) {
  const lastApplied = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (stage === undefined || stage === lastApplied.current) return
    lastApplied.current = stage
    apply(stage)
  }, [stage, apply])
}
