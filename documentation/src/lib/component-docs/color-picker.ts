import { type ComponentDoc, SIZE_PROP } from './types'

export const colorPicker: ComponentDoc = {
  name: 'ColorPicker',
  slug: 'color-picker',
  tagline: 'Pick a colour from presets, a native picker, or a hex field.',
  description:
    'A form control for choosing a colour. Three inputs stay in sync with the bound `value`: a row of preset swatch buttons (real `<button>`s with an `aria-pressed` selected state), a native `<input type="color">` for freeform picking, and a monospace hex text input for typing/pasting. Typed hex is normalised (leading `#` optional, case-insensitive); invalid hex is ignored rather than clobbering the value. Square swatches (house rule — zero radius), `--ss-*` tokens, keyboard accessible, WCAG 2.2 AA.',
  storyId: 'components-colorpicker--default',
  usage: `<script>
  import { ColorPicker } from 'dssoca';
  let colour = $state('#66ef73');
</script>

<ColorPicker bind:value={colour} label="Brand colour" />
<ColorPicker bind:value={colour} label="Team colour"
  presets={['#66ef73', '#9aa4ff', '#b98cff', '#66d9ef']} />`,
  props: [
    {
      name: 'value',
      type: 'string',
      default: "''",
      desc: 'Selected colour as a hex string, e.g. `#66ef73` (bindable).',
    },
    { name: 'label', type: 'string', desc: 'Field label (associated with the hex input).' },
    {
      name: 'presets',
      type: 'string[]',
      default: 'DEFAULT_PRESETS',
      desc: 'Preset swatch colours to quick-pick from; defaults to the on-brand token palette.',
    },
    { name: 'id', type: 'string', desc: 'Id for the hex text input (label association uses it).' },
    {
      name: 'name',
      type: 'string',
      desc: 'Form field name (mirrored onto the hex + native inputs).',
    },
    { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable all three controls.' },
    {
      name: 'onChange',
      type: '(value: string) => void',
      desc: 'Fired whenever the value changes (swatch, native picker, or hex input).',
    },
    SIZE_PROP,
  ],
}
