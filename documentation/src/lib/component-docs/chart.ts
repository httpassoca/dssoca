import { type ComponentDoc, SIZE_PROP } from './types'

export const chart: ComponentDoc = {
  name: 'Chart',
  slug: 'chart',
  tagline: 'Multi-series line, area, and bar chart.',
  description:
    'A token-driven chart for comparing one or more series as a line, filled area, or grouped bars. Scales and paths are computed from the data; the SVG is rendered as plain markup with `--ss-*`-styled axes, gridlines, and a cycling categorical palette. Every datum is keyboard-focusable and reveals an accessible tooltip; the chart auto-generates a screen-reader summary (or pass `summary`). Empty input shows an em-dash placeholder.',
  storyId: 'components-chart--default',
  usage: `<script>
  import { Chart } from 'dssoca';

  const series = [
    { label: 'Requests', data: [{ x: 0, y: 120 }, { x: 1, y: 180 }, { x: 2, y: 150 }] },
    { label: 'Errors', data: [{ x: 0, y: 12 }, { x: 1, y: 22 }, { x: 2, y: 9 }] },
  ];
</script>

<Chart {series} />
<Chart {series} variant="bar" />
<Chart {series} variant="area" fluid />`,
  props: [
    {
      name: 'series',
      type: 'ChartSeries[]',
      desc: 'Required. Each series has a `label`, `data: ChartPoint[]` ({ x: number | Date; y: number }), and an optional `color`.',
    },
    {
      name: 'variant',
      type: "'line' | 'area' | 'bar'",
      default: "'line'",
      desc: 'Rendering style. `bar` draws grouped bars per x-category across series.',
    },
    {
      name: 'xType',
      type: "'linear' | 'time' | 'band'",
      desc: 'X scale kind. Defaults to `band` for bars, `time` for Date x-values, else `linear`.',
    },
    {
      name: 'xFormat',
      type: '(x: number | Date) => string',
      desc: 'Format an x value for axis ticks + tooltip.',
    },
    {
      name: 'yFormat',
      type: '(y: number) => string',
      desc: 'Format a y value for axis ticks + tooltip.',
    },
    {
      name: 'height',
      type: 'number',
      default: '240',
      desc: 'Intrinsic drawing height in px.',
    },
    {
      name: 'width',
      type: 'number',
      default: '480',
      desc: 'Intrinsic drawing width in px.',
    },
    {
      name: 'fluid',
      type: 'boolean',
      default: 'false',
      desc: 'Stretch to the container width via the viewBox (width:100%).',
    },
    {
      name: 'legend',
      type: 'boolean',
      default: 'true',
      desc: 'Show the series legend (labels + colour swatches).',
    },
    {
      name: 'tooltip',
      type: 'boolean',
      default: 'true',
      desc: 'Reveal a tooltip on hover/focus of a datum. Each datum is keyboard-focusable.',
    },
    {
      name: 'summary',
      type: 'string',
      desc: 'Screen-reader summary + accessible name; auto-generated when absent.',
    },
    SIZE_PROP,
  ],
}
