<script lang="ts">
  import { Input } from 'dssoca'

  // Hex text field with the "echo" pattern: external value changes echo into
  // the field only while it is NOT focused (so programmatic updates — presets,
  // the color picker, a fix — never fight the user's typing), and a valid
  // entry commits upward immediately. Invalid drafts get the Input's error
  // affordance and snap back to the committed value on blur.
  interface Props {
    /** Committed #rrggbb value. */
    value: string
    label?: string
    id?: string
    /** Called with a normalized lowercase #rrggbb whenever the draft is valid. */
    onCommit: (hex: string) => void
  }
  let { value, label, id, onCommit }: Props = $props()

  const HEX = /^#?[0-9a-f]{6}$/i

  // `draft` only matters while the field is focused; unfocused, the committed
  // value shows (and is valid by definition). No sync effect needed, and the
  // prerendered markup always carries the committed value.
  let draft = $state('')
  let focused = $state(false)

  const shown = $derived(focused ? draft : value)
  const valid = $derived(!focused || HEX.test(draft.trim()))

  function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
    draft = e.currentTarget.value
    const t = draft.trim().toLowerCase()
    if (HEX.test(t)) onCommit(t.startsWith('#') ? t : `#${t}`)
  }
</script>

<div
  class="hex-field"
  onfocusin={() => {
    draft = value
    focused = true
  }}
  onfocusout={() => (focused = false)}
>
  <Input
    {label}
    {id}
    value={shown}
    oninput={handleInput}
    invalid={!valid}
    error={valid ? undefined : 'expected a #rrggbb hex'}
  />
</div>

<style lang="scss">
  .hex-field {
    display: contents;
  }
</style>
