import { type ComponentDoc, SIZE_PROP } from './types'

export const checkbox: ComponentDoc = {
  name: 'Checkbox',
  slug: 'checkbox',
  htmlExample: {
    props: { label: 'Email me updates', id: 'updates', name: 'updates', checked: true },
    behaviour: 'js',
    note: 'It is a native checkbox, so it toggles, takes Space and submits without any script. vanilla.js adds the mixed state (put data-indeterminate="true" on the input, or call setCheckbox(input, { indeterminate: true })) and emits ss:change with { checked }.',
  },
  tagline: 'Native checkbox with a mixed state.',
  description:
    'A real `<input type="checkbox">` drawn as a square box (house rule — zero radius), so Space, presses on the label, form submission (`name` / `value`) and the checked / unchecked / mixed announcements all come from the browser. Bindable `checked` and `indeterminate`; the box shows a check when checked and a dash when indeterminate, so the state never rests on colour alone.',
  storyId: 'components-checkbox--default',
  notes:
    'Toggling an indeterminate checkbox always lands on checked and clears `indeterminate`. `indeterminate` is set as the DOM property (there is no HTML attribute for it) and mirrored as `data-indeterminate` on the input; `aria-checked` is never written, because a native checkbox already exposes "mixed". `onchange` receives the new value only — there is no `details.reason`, since the browser reports a press on the box, a press on the label and Space as the same event. Keyboard focus shows the global focus ring (2px solid `--ss-primary`, offset 2px) around the box itself. The whole label is the pointer target (at least 24×24). Override the box edge with `--ss-checkbox-size` and the label gap with `--ss-checkbox-gap`.',
  usage: `<script>
  import { Checkbox } from 'dssoca';
  let updates = $state(true);
  let picked = $state([true, false, false]);
  const all = $derived(picked.every(Boolean));
  const some = $derived(picked.some(Boolean));
</script>

<Checkbox bind:checked={updates} name="updates" label="Email me updates" />

<!-- "select all" parent: mixed while only some children are picked -->
<Checkbox
  label="Select all"
  checked={all}
  indeterminate={some && !all}
  onchange={(checked) => (picked = picked.map(() => checked))}
/>`,
  props: [
    { name: 'checked', type: 'boolean', default: 'false', desc: 'Checked state (bindable).' },
    {
      name: 'indeterminate',
      type: 'boolean',
      default: 'false',
      desc: 'Mixed state (bindable): drawn as a dash, announced as "mixed". A user toggle clears it and lands on checked.',
    },
    {
      name: 'label',
      type: 'string',
      desc: 'Visible label next to the box; becomes the accessible name.',
    },
    {
      name: 'labelHidden',
      type: 'boolean',
      default: 'false',
      desc: 'Visually hide the label while keeping it as the accessible name — for dense rows such as table row selection.',
    },
    { name: 'id', type: 'string', desc: 'Id for the underlying input.' },
    {
      name: 'name',
      type: 'string',
      desc: 'Form field name: the checkbox is submitted with its form when checked.',
    },
    {
      name: 'value',
      type: 'string',
      desc: 'Submitted value when checked (the browser default is `on`).',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Disable: inert, non-toggling and not submitted.',
    },
    {
      name: 'describedby',
      type: 'string',
      desc: 'Id of an element that further describes the checkbox (→ aria-describedby).',
    },
    {
      name: 'onchange',
      type: '(checked: boolean) => void',
      desc: 'Fired after `checked` changes, with the new value. No `details.reason` (see the notes).',
    },
    SIZE_PROP,
  ],
}
