import { type ComponentDoc, SIZE_PROP } from './types'

export const scatterPlot: ComponentDoc = {
  name: 'ScatterPlot',
  slug: 'scatter-plot',
  tagline: 'Two-axis scatter with optional quadrants and bubble sizing.',
  description:
    'A token-driven scatter plot for comparing entities on two metrics at once. Each datum is a dot positioned by `x`/`y`, optionally sized by `size` (sqrt-scaled so area is true) and tinted by `color`. Pass `xRef`/`yRef` to split the plane into quadrants and `quadrantLabels` to caption them — ideal for "high score vs low wins"-style comparisons. Axes use the padded data extent (not forced to zero), every point is keyboard-focusable with an accessible tooltip, and empty input shows an em-dash placeholder.',
  storyId: 'components-scatterplot--quadrants',
  usage: `<script>
  import { ScatterPlot } from 'dssoca';

  const points = [
    { label: 'Ana', x: 8.9, y: 7.5, size: 27 },
    { label: 'Bruno', x: 8.5, y: 5.7, size: 14 },
    { label: 'Caio', x: 7.7, y: 4.5, size: 7 },
  ];
</script>

<ScatterPlot
  {points}
  xRef={8}
  yRef={5}
  xLabel="Consistency"
  yLabel="Power rating"
  quadrantLabels={{ tr: 'steady star', br: 'spiky' }}
/>`,
  props: [
    {
      name: 'points',
      type: 'ScatterPoint[]',
      desc: 'Required. Each point has a `label`, `x`, `y`, and optional `size` (bubble area) and `color`.',
    },
    { name: 'xLabel', type: 'string', desc: 'X axis caption drawn under the axis.' },
    { name: 'yLabel', type: 'string', desc: 'Y axis caption drawn rotated beside the axis.' },
    {
      name: 'xRef',
      type: 'number',
      desc: 'Dashed vertical reference line at this x (e.g. the median) — splits into quadrants.',
    },
    {
      name: 'yRef',
      type: 'number',
      desc: 'Dashed horizontal reference line at this y — splits into quadrants.',
    },
    {
      name: 'quadrantLabels',
      type: '{ tl?; tr?; bl?; br? }',
      desc: 'Corner captions for the four quadrants (reads best with xRef + yRef).',
    },
    { name: 'xDomain', type: '[number, number]', desc: 'Force the x domain; defaults to the padded data extent.' },
    { name: 'yDomain', type: '[number, number]', desc: 'Force the y domain; defaults to the padded data extent.' },
    { name: 'xFormat', type: '(x: number) => string', desc: 'Format an x value for ticks + tooltip.' },
    { name: 'yFormat', type: '(y: number) => string', desc: 'Format a y value for ticks + tooltip.' },
    { name: 'showLabels', type: 'boolean', default: 'true', desc: "Draw each point's label next to its dot." },
    { name: 'height', type: 'number', default: '320', desc: 'Intrinsic drawing height in px.' },
    { name: 'width', type: 'number', default: '420', desc: 'Intrinsic drawing width in px.' },
    { name: 'fluid', type: 'boolean', default: 'false', desc: 'Stretch to the container width via the viewBox.' },
    {
      name: 'tooltip',
      type: 'boolean',
      default: 'true',
      desc: 'Reveal a tooltip on hover/focus of a point. Each point is keyboard-focusable.',
    },
    { name: 'summary', type: 'string', desc: 'Screen-reader summary + accessible name; auto-generated when absent.' },
    SIZE_PROP,
  ],
}
