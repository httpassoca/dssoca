<script module lang="ts">
  import type { IconName } from './Icon.svelte'

  /** One option in a {@link SegmentedControl}. */
  export interface SegmentOption {
    value: string
    label: string
    /** Optional leading glyph. */
    icon?: IconName
    disabled?: boolean
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // SCAFFOLD STUB — DS-0053 (SegmentedControl component).
  // Implement: N exclusive options, highlighted selection (zero radius),
  // role=radiogroup/radio (or tablist/tab) with roving tabindex + arrow-key
  // nav, bindable `value` + onChange, `fullWidth`, size-token density.
  // ─────────────────────────────────────────────────────────────────────────
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Mutually-exclusive options. */
    options?: SegmentOption[]
    /** Selected option value (bindable in the real implementation). */
    value?: string
    /** Fired when the selection changes. */
    onChange?: (value: string) => void
    /** Stretch segments to fill the container. */
    fullWidth?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let { options = [], value, onChange, fullWidth = false, size }: Props = $props()
</script>

<div
  class="ss-segmented"
  class:full={fullWidth}
  role="radiogroup"
  data-size-variant={resolveComponentSize('SegmentedControl', size)}
>
  {#each options as opt (opt.value)}
    <button
      type="button"
      role="radio"
      aria-checked={value === opt.value}
      disabled={opt.disabled}
      onclick={() => onChange?.(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

<style lang="scss">
  // TODO(DS-0053): selected pill + segmented styling.
  .ss-segmented { display: inline-flex; }
</style>
