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
