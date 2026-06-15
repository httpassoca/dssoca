import { type ComponentDoc, SIZE_PROP } from './types'

// `switch` is a reserved word — export under `switchDoc`.
export const switchDoc: ComponentDoc = {
  name: 'Switch',
  slug: 'switch',
  tagline: 'Accessible on/off toggle.',
  description:
    'A binary toggle built on a native `<button role="switch">`, so Space and Enter activate it for free. Bindable `checked`, an optional adjacent `label` (clicking it toggles too) that becomes the accessible name, and `disabled` for inert state. Square track and square thumb (house rule — no rounded pill); the track fills with the brand colour when on, transitions respect reduced-motion.',
  storyId: 'components-switch--default',
  usage: `<script>
  import { Switch } from 'dssoca';
  let enabled = $state(false);
</script>

<Switch bind:checked={enabled} label="Notifications" />
<Switch checked disabled label="Locked on" />`,
  props: [
    { name: 'checked', type: 'boolean', default: 'false', desc: 'On/off state (bindable).' },
    {
      name: 'label',
      type: 'string',
      desc: 'Visible label rendered adjacent to the track; becomes the accessible name.',
    },
    { name: 'id', type: 'string', desc: 'Id for the underlying button.' },
    { name: 'name', type: 'string', desc: 'Form field name (mirrored onto a data attribute).' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable: inert + non-toggling.' },
    {
      name: 'describedby',
      type: 'string',
      desc: 'Id of an element that further describes the switch (→ aria-describedby).',
    },
    {
      name: 'onchange',
      type: '(checked: boolean) => void',
      desc: 'Fired after `checked` flips, with the new value.',
    },
    SIZE_PROP,
  ],
}
