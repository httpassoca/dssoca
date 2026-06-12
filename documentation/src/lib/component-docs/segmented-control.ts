import { type ComponentDoc, SIZE_PROP } from './types'

export const segmentedControl: ComponentDoc = {
  name: 'SegmentedControl',
  slug: 'segmented-control',
  tagline: 'Compact row of mutually-exclusive options.',
  description:
    'A compact, inline toggle for picking one of a few options (view, mode, locale). The selected segment is highlighted with a token-driven fill (zero radius), and the group behaves as a single radiogroup: one tab stop, arrow / Home / End keys move and select, disabled options are skipped.',
  storyId: 'components-segmentedcontrol--default',
  usage: `<script>
  import { SegmentedControl } from 'dssoca';
  let view = $state('grid');
</script>

<SegmentedControl
  label="View mode"
  options={[
    { value: 'list', label: 'List', icon: 'logs' },
    { value: 'grid', label: 'Grid', icon: 'grid' },
    { value: 'map', label: 'Map' },
  ]}
  bind:value={view}
/>`,
  props: [
    {
      name: 'options',
      type: 'SegmentOption[]',
      default: '[]',
      desc: 'Mutually-exclusive options: { value, label, icon?, disabled? }.',
    },
    { name: 'value', type: 'string', desc: 'Selected option value (bindable).' },
    {
      name: 'label',
      type: 'string',
      desc: 'Accessible name for the group (required → aria-label on the radiogroup).',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      desc: 'Fired when the selection changes, after `value` updates.',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      desc: 'Stretch segments to equal widths and fill the container.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Disable the whole control: every segment is rendered inert (disabled, skipped by keyboard nav, no tab stop) and the group carries aria-disabled="true". Per-option `disabled` still disables individual segments.',
    },
    SIZE_PROP,
  ],
  notes:
    'WCAG 2.2 AA: `role="radiogroup"` with `role="radio"` segments, roving tabindex (one tab stop), and arrow / Home / End navigation that moves focus and selection together while skipping disabled segments. A `label` is required so the choice has an accessible name. For switching mutually-exclusive views/panels, a tablist/tab + tabpanel pattern is the alternative; this component implements the radiogroup pattern for value selection.',
}
