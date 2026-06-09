import { type ComponentDoc, SIZE_PROP } from './types';

// SCAFFOLD STUB (DS-0043) — fleshed out by the SegmentedControl implementation (DS-0053).
export const segmentedControl: ComponentDoc = {
  name: 'SegmentedControl',
  slug: 'segmented-control',
  tagline: 'Compact row of mutually-exclusive options.',
  description:
    'A compact, inline toggle for picking one of a few options (view, mode, locale) — with a highlighted selection, arrow-key navigation, and radiogroup semantics.',
  storyId: 'components-segmentedcontrol--default',
  usage: `<script>
  import { SegmentedControl } from 'dssoca';
  let value = $state('en');
</script>

<SegmentedControl options={[{ value: 'en', label: 'EN' }, { value: 'pt', label: 'PT' }]} bind:value />`,
  props: [
    { name: 'options', type: 'SegmentOption[]', default: '[]', desc: 'Options: { value, label, icon?, disabled? }.' },
    { name: 'value', type: 'string', desc: 'Selected option value (bindable).' },
    { name: 'onChange', type: '(value: string) => void', desc: 'Fired when the selection changes.' },
    { name: 'fullWidth', type: 'boolean', default: 'false', desc: 'Stretch segments to fill the container.' },
    SIZE_PROP,
  ],
  notes: 'Implementation tracked in agile DS-0053.',
};
