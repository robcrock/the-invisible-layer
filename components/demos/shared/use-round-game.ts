'use client'

import { useEffect, useReducer, useState } from 'react'

// The two-round measurement machine every game widget shares, extracted
// from the original fitts-timer. Contract with the scroll-synced deck:
// - 'arm' and 'disarm' come from stage sync only. Arming shows a start
//   overlay; it NEVER starts the clock. Both are ignored mid-round and
//   after results (recorded numbers are never clobbered by scrolling).
// - 'arm 2' while nothing has been played arms round 1 instead — rounds
//   run in order or the comparison is meaningless.
// - 'start' comes from a presenter click only.
// - Only 'reset' returns to idle.

export type RoundResult = {
  totalMs: number
  hits: number
  misses: number
  wrongHits: number
  capped: boolean
}

export type GameState =
  | { phase: 'idle' }
  | { phase: 'armed'; round: 1 | 2; round1?: RoundResult }
  | {
      phase: 'running'
      round: 1 | 2
      round1?: RoundResult
      hits: number
      misses: number
      wrongHits: number
      startedAt: number
    }
  | { phase: 'between'; round1: RoundResult }
  | { phase: 'results'; round1: RoundResult; round2: RoundResult }

export type GameEvent =
  | { type: 'arm'; round: 1 | 2 }
  | { type: 'disarm' }
  | { type: 'start'; t: number }
  | { type: 'hit'; t: number }
  | { type: 'miss' }
  | { type: 'wrongHit' }
  | { type: 'cap'; t: number }
  | { type: 'reset' }

function finishRound(
  s: Extract<GameState, { phase: 'running' }>,
  t: number,
  capped: boolean,
): GameState {
  const result: RoundResult = {
    totalMs: t - s.startedAt,
    hits: capped ? s.hits : s.hits + 1,
    misses: s.misses,
    wrongHits: s.wrongHits,
    capped,
  }
  if (s.round === 1) return { phase: 'between', round1: result }
  return { phase: 'results', round1: s.round1!, round2: result }
}

function reduce(s: GameState, e: GameEvent, hitsPerRound: number): GameState {
  switch (e.type) {
    case 'arm': {
      if (s.phase === 'running' || s.phase === 'results') return s
      // Round 2 can only follow a recorded round 1.
      const round = e.round === 2 && s.phase !== 'between' && !(s.phase === 'armed' && s.round1) ? 1 : e.round
      if (s.phase === 'armed') {
        if (s.round === round) return s
        return { phase: 'armed', round, round1: s.round1 }
      }
      if (s.phase === 'between') return { phase: 'armed', round, round1: s.round1 }
      return { phase: 'armed', round: 1 }
    }
    case 'disarm':
      if (s.phase !== 'armed') return s
      return s.round1 ? { phase: 'between', round1: s.round1 } : { phase: 'idle' }
    case 'start':
      if (s.phase === 'idle')
        return { phase: 'running', round: 1, hits: 0, misses: 0, wrongHits: 0, startedAt: e.t }
      if (s.phase === 'armed')
        return {
          phase: 'running',
          round: s.round,
          round1: s.round1,
          hits: 0,
          misses: 0,
          wrongHits: 0,
          startedAt: e.t,
        }
      if (s.phase === 'between')
        return {
          phase: 'running',
          round: 2,
          round1: s.round1,
          hits: 0,
          misses: 0,
          wrongHits: 0,
          startedAt: e.t,
        }
      return s
    case 'hit':
      if (s.phase !== 'running') return s
      if (s.hits + 1 >= hitsPerRound) return finishRound(s, e.t, false)
      return { ...s, hits: s.hits + 1 }
    case 'miss':
      return s.phase === 'running' ? { ...s, misses: s.misses + 1 } : s
    case 'wrongHit':
      return s.phase === 'running' ? { ...s, wrongHits: s.wrongHits + 1 } : s
    case 'cap':
      return s.phase === 'running' ? finishRound(s, e.t, true) : s
    case 'reset':
      return { phase: 'idle' }
  }
}

export function useRoundGame({
  hitsPerRound,
  capMs = 25_000, // mercy ceiling — "you get the point"
}: {
  hitsPerRound: number
  capMs?: number
}) {
  const [state, dispatch] = useReducer(
    (s: GameState, e: GameEvent) => reduce(s, e, hitsPerRound),
    { phase: 'idle' } as GameState,
  )
  const [elapsed, setElapsed] = useState(0)

  const running = state.phase === 'running' ? state : null

  // Display clock — rAF only touches display state, never the machine.
  useEffect(() => {
    if (!running) return
    let raf = 0
    const tick = () => {
      setElapsed(performance.now() - running.startedAt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  // Mercy cap: fires after capMs with no machine event (each hit/miss
  // resets it — same semantics as the original fitts-timer).
  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => dispatch({ type: 'cap', t: performance.now() }), capMs)
    return () => clearTimeout(id)
  }, [running, capMs])

  // Index into the widget's target sequence while running, else null.
  const targetStep = running ? running.hits : null

  return { state, dispatch, elapsed, targetStep }
}
