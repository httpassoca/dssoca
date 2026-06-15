import { type ComponentDoc, SIZE_PROP } from './types'

export const boxPlot: ComponentDoc = {
  name: 'BoxPlot',
  slug: 'box-plot',
  tagline: 'Box-and-whisker distributions with an optional point overlay.',
  description:
    'A token-driven box plot for comparing the score distributions of a few players (or any groups) at a glance — a short box means a consistent scorer. Each group draws Tukey whiskers, a quartile box (Q1–Q3) tinted in the group `color`, and a median line; pass `showPoints` to overlay every value as a deterministically jittered dot (no SSR/hydration randomness). The y axis uses the padded data extent across all values, every box is keyboard-focusable with a five-number-summary tooltip, and empty input shows an em-dash placeholder.',
  storyId: 'components-boxplot--default',
  usage: `<script>
  import { BoxPlot } from 'dssoca';

  const groups = [
    { label: 'Ana', values: [20000, 21000, 19500, 22000, 20500] },
    { label: 'Bruno', values: [15000, 18000, 12000, 22000, 9000] },
    { label: 'Caio', values: [17000, 17500, 16800, 18200, 17000] },
  ];
</script>

<BoxPlot {groups} yLabel="Score" />`,
  props: [
    {
      name: 'groups',
      type: 'BoxGroup[]',
      desc: 'Required. One box per group; each has a `label`, `values` (number[]), and optional `color`.',
    },
    {
      name: 'showPoints',
      type: 'boolean',
      default: 'true',
      desc: 'Overlay every value as a small jittered dot (deterministic, SSR-safe).',
    },
    { name: 'yLabel', type: 'string', desc: 'Y axis caption drawn rotated beside the axis.' },
    {
      name: 'yDomain',
      type: '[number, number]',
      desc: 'Force the y domain; defaults to the padded data extent across all values.',
    },
    {
      name: 'yFormat',
      type: '(y: number) => string',
      desc: 'Format a y value for ticks + tooltip.',
    },
    { name: 'height', type: 'number', default: '300', desc: 'Intrinsic drawing height in px.' },
    { name: 'width', type: 'number', default: '420', desc: 'Intrinsic drawing width in px.' },
    {
      name: 'fluid',
      type: 'boolean',
      default: 'false',
      desc: 'Stretch to the container width via the viewBox.',
    },
    {
      name: 'tooltip',
      type: 'boolean',
      default: 'true',
      desc: 'Reveal a five-number-summary tooltip on hover/focus of a box. Each box is keyboard-focusable.',
    },
    {
      name: 'summary',
      type: 'string',
      desc: 'Screen-reader summary + accessible name; auto-generated when absent.',
    },
    SIZE_PROP,
  ],
}
