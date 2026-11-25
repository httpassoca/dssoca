import { type ComponentDoc, SIZE_PROP } from './types'

export const radioGroup: ComponentDoc = {
  name: 'RadioGroup',
  slug: 'radio-group',
  htmlExample: {
    props: {
      options: [
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro' },
        { value: 'team', label: 'Team', disabled: true },
      ],
      value: 'pro',
      name: 'plan',
      label: 'Plan',
    },
    behaviour: 'js',
    note: 'These are native radios sharing a name, so selection, arrow keys, Space and form submission work without any script. vanilla.js keeps the single tab stop on the selection and emits ss:change with { value, index }.',
  },
  tagline: 'One choice from a short list, as native radios.',
  description:
    'A group of real `<input type="radio">` elements sharing a `name` inside a `role="radiogroup"` named by its visible `label`. Arrow keys (wrapping, skipping disabled options, mirrored under RTL), Space and form submission come from the browser. Radios are square (house rule — zero radius): a filled inner square marks the selected one, so the selection never rests on colour alone. Bindable `value`, per-option or whole-group `disabled`, `vertical` or `horizontal` layout.',
  storyId: 'components-radiogroup--default',
  notes:
    'The group is one tab stop: the selected radio, or the first enabled one when nothing is selected (or the selection is disabled). `onChange` receives the new value only — there is no `details.reason`, since the browser reports a press and an arrow key as the same `change` event. When `name` is omitted a per-instance name is generated, because radios only behave as a group when they share one. Keyboard focus shows the global focus ring (2px solid `--ss-primary`, offset 2px) around the radio itself; each option label is the pointer target (at least 24×24). Override the box edge with `--ss-radio-size` and the gap between options with `--ss-radio-gap`.',
  usage: `<script>
  import { RadioGroup } from 'dssoca';
  let plan = $state('pro');
</script>

<RadioGroup
  label="Plan"
  name="plan"
  bind:value={plan}
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team', disabled: true },
  ]}
  onChange={(value) => console.log(value)}
/>`,
  props: [
    {
      name: 'options',
      type: 'RadioOption[]',
      default: '[]',
      desc: 'Mutually-exclusive options: `{ value, label, disabled? }`.',
    },
    {
      name: 'value',
      type: 'string',
      desc: 'Selected option value (bindable); unset means nothing is selected.',
    },
    {
      name: 'label',
      type: 'string',
      desc: 'Visible group label; names the radiogroup (required).',
    },
    {
      name: 'name',
      type: 'string',
      desc: 'Form field name shared by the radios; the selected value is submitted with the form. Generated per instance when omitted.',
    },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      desc: 'Stack the options or lay them out in a wrapping row.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Disable every radio and mark the group `aria-disabled`.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      desc: 'Fired when the selection changes, with the new value. No `details.reason` (see the notes).',
    },
    SIZE_PROP,
  ],
}
