/**
 * Categorical palette shared by the chart family (Chart, ScatterPlot, BoxPlot,
 * BumpChart) and Avatar. Built entirely from the terminal root slots so a
 * theme flip — or an imported custom palette — recolors every series.
 *
 * Order and length are stable API: Avatar's name-hash → index mapping depends
 * on them (a given name must keep its colour across releases), and chart
 * series keep their assigned colour by index.
 */
export const CHART_PALETTE = [
  'var(--ss-accent)',
  'var(--ss-blue)',
  'var(--ss-magenta)',
  'var(--ss-cyan)',
  'var(--ss-yellow)',
  'var(--ss-green)',
] as const
