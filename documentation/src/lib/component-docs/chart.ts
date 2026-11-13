import { type ComponentDoc, SIZE_PROP } from './types'

export const chart: ComponentDoc = {
  name: 'Chart',
  slug: 'chart',
  htmlExample: {
    props: {
      series: [
        {
          label: 'cpu',
          data: [
            { x: 1, y: 12 },
            { x: 2, y: 18 },
            { x: 3, y: 9 },
            { x: 4, y: 22 },
          ],
        },
      ],
      variant: 'line',
      legend: true,
    },
    behaviour: 'css',
    note: "Charts are rendered geometry: copy the SVG as-is (including each line's `stroke-dasharray` and the matching legend `.swatch-line`). Hover tooltips and arrow-key navigation are not wired by vanilla.js.",
  },
  tagline: 'Multi-series line, area, and bar chart.',
  description:
    'A token-driven chart for comparing one or more series as a line, filled area, or grouped bars. Scales and paths are computed from the data; the SVG is rendered as plain markup with `--ss-*`-styled axes, gridlines, and a cycling categorical palette. Line and area series are told apart without colour: series 0 is solid and each later series takes a dash pattern from the fixed `CHART_DASH_CYCLE`, and the legend keys draw the same pattern; `endLabels` also prints each series\' name at the end of its line. The chart is a single tab stop: arrow keys (and Home/End) move between data points or bars, each exposed as `role="img"` with a label that carries its series, x and y value. The visual tooltip is hidden from assistive tech and closes on Escape. The chart auto-generates a screen-reader summary (or pass `summary`). Empty input shows an em-dash placeholder.',
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
<Chart {series} variant="area" fluid />
<Chart {series} endLabels />`,
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
      desc: "Show the series legend: labels plus a colour key. Line/area keys are short strokes with the series' dash pattern; bar keys are colour blocks.",
    },
    {
      name: 'dashes',
      type: 'boolean',
      default: 'true',
      desc: 'Line/area: series 0 stays solid and each later series gets a `stroke-dasharray` from the fixed `CHART_DASH_CYCLE`, so series differ by more than colour. Set `false` for all-solid lines.',
    },
    {
      name: 'endLabels',
      type: 'boolean',
      default: 'false',
      desc: "Line/area: print each series' label directly after its last datum (labels are nudged apart so they never overlap; the right margin grows to fit them).",
    },
    {
      name: 'tooltip',
      type: 'boolean',
      default: 'true',
      desc: "Reveal a visual tooltip on hover/focus of a datum (aria-hidden; the datum's own label carries the same text). Escape dismisses it.",
    },
    {
      name: 'summary',
      type: 'string',
      desc: 'Screen-reader summary + accessible name; auto-generated when absent.',
    },
    SIZE_PROP,
  ],
}
