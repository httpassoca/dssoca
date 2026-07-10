<script lang="ts">
  import { Button } from 'dssoca'
  import HexField from './HexField.svelte'
  import type { PaletteSlot } from '$lib/theme-builder/types'

  interface Props {
    slot: PaletteSlot
    /** The theme the edit applies to (the previewed one). */
    theme: 'dark' | 'light'
    /** Current resolved hex for slot+theme. */
    value: string
    /** Whether a manual override is active on this slot+theme. */
    overridden: boolean
    /** Write a manual override for this slot on the previewed theme. */
    onChange: (hex: string) => void
    /** Remove the override — back to the derived value. */
    onReset: () => void
    onDone: () => void
  }
  let { slot, theme, value, overridden, onChange, onReset, onDone }: Props = $props()

  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      copied = true
      clearTimeout(timer)
      timer = setTimeout(() => (copied = false), 1500)
    } catch {
      // clipboard unavailable (e.g. insecure context) — no-op
    }
  }
</script>

<div class="editor">
  <div class="head">
    <code class="slot">{slot}</code>
    <span class="scope">{theme} theme</span>
  </div>
  <div class="body">
    <div class="field">
      <HexField {value} onCommit={onChange} />
    </div>
    <div class="actions">
      <Button variant="ghost" onclick={copy}>{copied ? 'copied' : 'copy'}</Button>
      <Button variant="ghost" onclick={onReset} disabled={!overridden}>reset</Button>
      <Button variant="secondary" onclick={onDone}>done</Button>
    </div>
  </div>
</div>

<style lang="scss">
  .editor {
    border: 1px solid var(--ss-line-strong);
    background: var(--ss-bg-elev);
    padding: var(--ss-s-3) var(--ss-s-4);
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-2);
  }
  .head {
    display: flex;
    align-items: baseline;
    gap: var(--ss-s-2);

    .slot {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-shine);
    }
    .scope {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  }
  .body {
    display: flex;
    align-items: flex-start;
    gap: var(--ss-gap);
    flex-wrap: wrap;
  }
  .field {
    flex: 0 1 12rem;
  }
  .actions {
    display: inline-flex;
    gap: var(--ss-s-1);
  }
</style>
