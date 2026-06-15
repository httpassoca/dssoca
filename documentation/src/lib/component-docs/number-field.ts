import { type ComponentDoc, SIZE_PROP } from './types'

export const numberField: ComponentDoc = {
  name: 'NumberField',
  slug: 'number-field',
  tagline: 'Numeric input with steppers.',
  description:
    'A numeric text field built on a native `<input type="number">` with monospace value display and a pair of − / + stepper buttons. Steppers increment/decrement by `step`, clamp to `min`/`max`, and disable at their bound. Clearing the field yields `null`. Mirrors the Input chrome — label, hint/error text, focus ring on the wrapper, and `aria-describedby` ordering (error → hint → describedby).',
  storyId: 'components-numberfield--default',
  usage: `<script>
  import { NumberField } from 'dssoca';
  let replicas = $state(3);
</script>

<NumberField label="Replicas" bind:value={replicas} min={0} max={10} />`,
  props: [
    { name: 'label', type: 'string', desc: 'Label text associated to the input via for/id.' },
    { name: 'value', type: 'number | null', desc: 'Bindable current value; `null` when empty.' },
    {
      name: 'min',
      type: 'number',
      desc: 'Lower bound; clamps the steppers and disables − at the floor.',
    },
    {
      name: 'max',
      type: 'number',
      desc: 'Upper bound; clamps the steppers and disables + at the ceiling.',
    },
    {
      name: 'step',
      type: 'number',
      default: '1',
      desc: 'Increment/decrement applied by the steppers.',
    },
    { name: 'name', type: 'string', desc: 'Native form field name.' },
    { name: 'placeholder', type: 'string', desc: 'Placeholder shown when the field is empty.' },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      desc: 'Marks the field required; renders a label marker.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Disables the input and both steppers.',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      desc: 'Value visible but not editable; steppers inert.',
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
      desc: 'Error text; implies aria-invalid and is announced via role="alert".',
    },
    {
      name: 'describedby',
      type: 'string',
      desc: 'Extra aria-describedby id(s), appended after error/hint.',
    },
    {
      name: 'onchange',
      type: '(e: Event) => void',
      desc: 'Native change handler fired when the committed value changes.',
    },
    SIZE_PROP,
  ],
  notes:
    'WCAG 2.2 AA. The native spinner is hidden in favour of accessible − / + buttons labelled "Decrease" / "Increase"; each is disabled at its bound or when the field is disabled/readonly. The value is rendered monospace.',
}
