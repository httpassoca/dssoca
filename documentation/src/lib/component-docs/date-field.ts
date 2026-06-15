import { type ComponentDoc, SIZE_PROP } from './types'

export const dateField: ComponentDoc = {
  name: 'DateField',
  slug: 'date-field',
  tagline: 'Styled native date input.',
  description:
    'A styled wrapper around the native `<input type="date">`, sharing the field chrome of `Input`: label association, focus ring on the wrapper, hint/error messaging wired through `aria-describedby`, and invalid/disabled/readonly states. Bind an ISO `yyyy-mm-dd` string via `value` and constrain the range with `min`/`max`. The calendar picker glyph is tuned to read on the dark theme; zero border-radius.',
  storyId: 'components-datefield--default',
  usage: `<script>
  import { DateField } from 'dssoca';
  let date = $state('2026-06-15');
</script>

<DateField label="Start date" bind:value={date} />
<DateField label="Booking" bind:value={date} min="2026-06-01" max="2026-06-30" />`,
  props: [
    { name: 'label', type: 'string', desc: 'Label text; rendered and associated to the input.' },
    {
      name: 'id',
      type: 'string',
      desc: 'Input id; auto-generated for label association when unset.',
    },
    { name: 'name', type: 'string', desc: 'Native form field name.' },
    {
      name: 'value',
      type: 'string',
      default: "''",
      desc: 'Bindable ISO date string (yyyy-mm-dd).',
    },
    { name: 'min', type: 'string', desc: 'Earliest selectable date (ISO yyyy-mm-dd).' },
    { name: 'max', type: 'string', desc: 'Latest selectable date (ISO yyyy-mm-dd).' },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      desc: 'Marks the field as required for form validation.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Renders the field non-interactive.',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      desc: 'Native readonly — value visible but not editable; rendered muted.',
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
      desc: 'Error text under the field; implies aria-invalid and is announced via role="alert".',
    },
    {
      name: 'describedby',
      type: 'string',
      desc: 'Extra id(s) appended to aria-describedby after error/hint.',
    },
    {
      name: 'onchange',
      type: '(e: Event) => void',
      desc: 'Native change handler (fired when the committed date changes).',
    },
    { name: 'oninput', type: '(e: Event) => void', desc: 'Native input handler.' },
    SIZE_PROP,
  ],
}
