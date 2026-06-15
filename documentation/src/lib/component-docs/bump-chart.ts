import { type ComponentDoc, SIZE_PROP } from './types'

export const bumpChart: ComponentDoc = {
  name: 'BumpChart',
  slug: 'bump-chart',
  tagline: 'Ranking-over-stages chart that shows who led and who overtook whom.',
  description:
    'A token-driven bump chart for tracking finishing rank across an ordered sequence of stages (e.g. the four games of one Friday). Each series is a competitor; its 1-based `ranks` are plotted with rank 1 drawn at the top, connected by lines so crossings reveal overtakes. The x-axis uses a `scalePoint` over `stages`, the y-axis runs integer rank ticks top-down, and `showLabels` puts each series name at its last node (direct labelling). Every node is keyboard-focusable with an accessible tooltip, series absent from a stage (non-finite rank) are skipped while the line still connects present nodes, and empty input shows an em-dash placeholder.',
  storyId: 'components-bumpchart--default',
  usage: `<script>
  import { BumpChart } from 'dssoca';

  const stages = ['G1', 'G2', 'G3', 'G4'];
  const series = [
    { label: 'Ana', ranks: [1, 2, 1, 1] },
    { label: 'Bruno', ranks: [2, 1, 3, 2] },
    { label: 'Caio', ranks: [3, 4, 2, 3] },
  ];
</script>

<BumpChart {series} {stages} />`,
  props: [
    {
      name: 'series',
      type: 'BumpSeries[]',
      desc: 'Required. Each series has a `label`, 1-based `ranks` (length must match `stages`) and optional `color`.',
    },
    {
      name: 'stages',
      type: 'string[]',
      desc: 'Required. Ordered x-axis category labels (e.g. ["G1","G2","G3","G4"]).',
    },
    {
      name: 'showLabels',
      type: 'boolean',
      default: 'true',
      desc: 'Draw each series label at its last node (direct labelling).',
    },
    { name: 'height', type: 'number', default: '280', desc: 'Intrinsic drawing height in px.' },
    { name: 'width', type: 'number', default: '480', desc: 'Intrinsic drawing width in px.' },
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
      desc: 'Reveal a tooltip on hover/focus of a node. Each node is keyboard-focusable.',
    },
    {
      name: 'summary',
      type: 'string',
      desc: 'Screen-reader summary + accessible name; auto-generated when absent.',
    },
    SIZE_PROP,
  ],
}
