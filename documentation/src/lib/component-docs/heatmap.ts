import { type ComponentDoc, SIZE_PROP } from './types'

export const heatmap: ComponentDoc = {
  name: 'Heatmap',
  slug: 'heatmap',
  htmlExample: {
    props: {
      rows: ['api', 'db'],
      columns: ['mon', 'tue', 'wed'],
      values: [
        [3, 7, 2],
        [5, 1, 8],
      ],
    },
    behaviour: 'css',
    note: 'Rendered geometry: copy as-is. Hover tooltips and arrow-key navigation are not wired by vanilla.js.',
  },
  tagline: 'Token-driven matrix where cell colour intensity encodes value.',
  description:
    "A token-driven matrix/grid where each cell's colour intensity encodes its value, with row and column headers. Every cell is filled with `--ss-primary` and varies its opacity across a linear scale over the value domain, so the brightest cells are the strongest. `null` values render a blank cell that is excluded from the scale — ideal for a head-to-head win matrix where the diagonal (self) is empty. Cells are exposed as a `grid` > `row` > `gridcell` structure, each named `<row> vs <col>: <value>` (`no value` for blanks). Value text is drawn in `--ss-fg` on an `--ss-bg` halo so it stays readable on every intensity, and with `showValues={false}` a min→max legend keys the colour scale. Empty input shows an em-dash placeholder.",
  notes:
    'Keyboard: the grid is a single Tab stop (the top-left cell by default, then the last focused cell). Arrow keys move between cells (Left/Right within a row, Up/Down between rows, clamped at the edges); Home/End jump to the first/last cell. The hover/focus tooltip is visual only (`aria-hidden`) because every cell already carries its value in its accessible name; Escape dismisses it, including one opened by hover. The in-cell value text is `aria-hidden` too, since it duplicates the cell name.',
  storyId: 'components-heatmap--default',
  usage: `<script>
  import { Heatmap } from 'dssoca';

  const players = ['Ana', 'Bruno', 'Caio', 'Duda'];
  const wins = [
    [null, 5, 7, 9],
    [3, null, 6, 8],
    [2, 4, null, 5],
    [1, 2, 3, null],
  ];
</script>

<Heatmap
  rows={players}
  columns={players}
  values={wins}
  xLabel="Opponent"
  yLabel="Player"
/>`,
  props: [
    { name: 'rows', type: 'string[]', desc: 'Required. Row labels, top→bottom.' },
    { name: 'columns', type: 'string[]', desc: 'Required. Column labels, left→right.' },
    {
      name: 'values',
      type: '(number | null)[][]',
      desc: 'Required. `values[r][c]`; `null` renders a blank cell excluded from the colour scale (e.g. the diagonal).',
    },
    {
      name: 'domain',
      type: '[number, number]',
      desc: 'Value range mapped to colour intensity; defaults to the [min, max] of all non-null values.',
    },
    {
      name: 'valueFormat',
      type: '(v: number) => string',
      desc: 'Format a cell value for its text + tooltip.',
    },
    {
      name: 'showValues',
      type: 'boolean',
      default: 'true',
      desc: 'Render the value text inside each cell. When false, a min→max legend is drawn under the grid so intensity is not the only cue.',
    },
    { name: 'xLabel', type: 'string', desc: 'X axis caption drawn under the column headers.' },
    {
      name: 'yLabel',
      type: 'string',
      desc: 'Y axis caption drawn rotated beside the row headers.',
    },
    { name: 'cellSize', type: 'number', default: '48', desc: 'Square cell size in px.' },
    {
      name: 'tooltip',
      type: 'boolean',
      default: 'true',
      desc: 'Reveal a tooltip on hover/focus of a cell (visual only; Escape dismisses it).',
    },
    {
      name: 'summary',
      type: 'string',
      desc: 'Screen-reader summary + accessible name; auto-generated when absent.',
    },
    SIZE_PROP,
  ],
}
