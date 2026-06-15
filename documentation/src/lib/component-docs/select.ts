import { type ComponentDoc, SIZE_PROP } from './types'

export const select: ComponentDoc = {
  name: 'Select',
  slug: 'select',
  tagline: 'Styled native dropdown.',
  description:
    'A native `<select>` wrapped in the shared field chrome — best-in-class keyboard and mobile a11y, with a custom CSS chevron and zero runtime deps. Pass a flat `options` list or grouped `SelectOptGroup[]` (auto-detected); add a `placeholder` for an empty first choice, and wire `hint`/`error` text via `aria-describedby` exactly like `Input`.',
  storyId: 'components-select--default',
  usage: `<script>
  import { Select } from 'dssoca';

  let country = $state('');
  const options = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
  ];
</script>

<Select label="Country" bind:value={country} {options} placeholder="Select a country…" />`,
  props: [
    {
      name: 'options',
      type: 'SelectOption[] | SelectOptGroup[]',
      default: '[]',
      desc: 'Flat options, or grouped options (detected by an `options` array on the first element).',
    },
    {
      name: 'value',
      type: 'string',
      default: "''",
      desc: 'Bindable selected value (`bind:value`).',
    },
    { name: 'label', type: 'string', desc: 'Label text; rendered as <label> wired to the select.' },
    {
      name: 'id',
      type: 'string',
      desc: 'Select id; auto-generated for label association when unset.',
    },
    { name: 'name', type: 'string', desc: 'Native form field name.' },
    {
      name: 'placeholder',
      type: 'string',
      desc: 'Disabled, hidden first option, selected while the value is empty.',
    },
    { name: 'required', type: 'boolean', default: 'false', desc: 'Marks the field required.' },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Renders the select non-interactive.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      desc: 'Marks the field invalid for assistive tech (aria-invalid).',
    },
    {
      name: 'hint',
      type: 'string',
      desc: 'Helper text under the field, wired via aria-describedby.',
    },
    {
      name: 'error',
      type: 'string',
      desc: 'Error text under the field; implies aria-invalid and is announced to AT (role="alert").',
    },
    {
      name: 'describedby',
      type: 'string',
      desc: 'Extra id(s) appended to aria-describedby after error/hint.',
    },
    {
      name: 'onchange',
      type: '(e: Event) => void',
      desc: 'Native change handler; fired on selection.',
    },
    SIZE_PROP,
  ],
}
