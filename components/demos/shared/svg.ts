import type * as React from 'react'

// Fixed viewBox, fluid width. The stage renders at ~550–650 CSS px wide,
// so viewBox units ≈ CSS px and "3px bar" / "2px line" stay honest claims.
export const VB = { w: 640, h: 360 } as const

// Plot margins inside the viewBox, shared by the chart widgets.
export const MARGIN = { top: 24, right: 24, bottom: 32, left: 44 } as const

export const PLOT = {
  x: MARGIN.left,
  y: MARGIN.top,
  w: VB.w - MARGIN.left - MARGIN.right,
  h: VB.h - MARGIN.top - MARGIN.bottom,
} as const

// Convert a pointer event to viewBox coordinates. The svg is width:100%
// with the aspect ratio locked by the viewBox, so scaling is uniform.
export function toViewBox(
  e: React.PointerEvent,
  el: SVGSVGElement,
): { x: number; y: number } {
  const r = el.getBoundingClientRect()
  return {
    x: ((e.clientX - r.left) / r.width) * VB.w,
    y: ((e.clientY - r.top) / r.height) * VB.h,
  }
}
