/**
 * Shared keyboard contract for the chart components (Chart, BoxPlot, BumpChart, ScatterPlot,
 * Heatmap): a chart is ONE tab stop, and the arrow keys move focus between its data marks
 * (roving tabindex). See agile DS-0161.
 *
 * - 1-D (default): ArrowRight/ArrowDown → next mark, ArrowLeft/ArrowUp → previous.
 * - 2-D (`cols` given, e.g. Heatmap): ArrowLeft/ArrowRight move within a row, ArrowUp/ArrowDown
 *   move by `cols`.
 * - Home/End → first/last mark. Movement clamps at the edges (no wrap-around).
 *
 * Returns the new index, or `null` when the key is not a navigation key (let it through).
 */
export function chartNavStep(
  key: string,
  index: number,
  count: number,
  cols?: number,
): number | null {
  if (count <= 0) return null
  const last = count - 1
  const clamp = (i: number) => Math.min(last, Math.max(0, i))
  const row = cols ?? 1
  switch (key) {
    case 'ArrowRight':
      return clamp(index + 1)
    case 'ArrowLeft':
      return clamp(index - 1)
    case 'ArrowDown':
      return cols ? (index + row <= last ? index + row : index) : clamp(index + 1)
    case 'ArrowUp':
      return cols ? (index - row >= 0 ? index - row : index) : clamp(index - 1)
    case 'Home':
      return 0
    case 'End':
      return last
    default:
      return null
  }
}

/** What a key on a chart does: move focus to another mark, or dismiss the tooltip. */
export type ChartAction = { type: 'focus'; index: number } | { type: 'dismiss' }

/** A key the chart handles: its action, and whether the browser default must be cancelled. */
export interface ChartKeyResult {
  action: ChartAction
  preventDefault: boolean
}

export interface ChartMarkState {
  /** Index of the mark that has focus. */
  index: number
  /** Number of marks in the chart. */
  count: number
  /** Columns of a 2-D grid (Heatmap); leave out for a 1-D chart. */
  cols?: number
  /**
   * How the focused mark treats Escape. Leave out when the mark leaves Escape to the window
   * handler ({@link chartWindowKey}). `'dismiss'` hides the tooltip from the mark and lets the
   * key carry on. `'consume'` also cancels the key, but only while a tooltip is showing.
   */
  escape?: 'dismiss' | 'consume'
  /** A tooltip is showing. Only read for `escape: 'consume'`. */
  tooltipOpen?: boolean
}

/**
 * A key on a focused mark. `null` = not a chart key, let it through.
 * SVG geometry does not mirror in RTL, so Left/Right stay physical.
 */
export function chartMarkKey(state: ChartMarkState, key: string): ChartKeyResult | null {
  if (key === 'Escape') {
    if (state.escape === 'dismiss') return { action: { type: 'dismiss' }, preventDefault: false }
    if (state.escape === 'consume' && state.tooltipOpen) {
      return { action: { type: 'dismiss' }, preventDefault: true }
    }
    return null
  }
  const index = chartNavStep(key, state.index, state.count, state.cols)
  return index === null ? null : { action: { type: 'focus', index }, preventDefault: true }
}

/**
 * A key anywhere on the page while a chart is mounted: Escape dismisses the tooltip, including
 * one opened by hover with focus elsewhere (WCAG 1.4.13). `null` = nothing to do.
 */
export function chartWindowKey(tooltipOpen: boolean, key: string): ChartAction | null {
  return tooltipOpen && key === 'Escape' ? { type: 'dismiss' } : null
}

/** The mark that is the chart's single tab stop: the last focused one, clamped to the marks. */
export function chartTabStop(focusIndex: number, count: number): number {
  return Math.min(focusIndex, Math.max(0, count - 1))
}
