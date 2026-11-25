<script lang="ts">
  import Popover from '$lib/components/Popover.svelte'
  import type { PopoverOpenChangeDetails } from '$lib/core/popover.js'
  import type { Size } from '$lib/config.js'

  interface Props {
    open?: boolean
    onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void
    side?: 'bottom' | 'top'
    align?: 'start' | 'end'
    label?: string
    size?: Size
    trigger?: string
    /** Render focusable content in the panel (two buttons); otherwise plain text. */
    focusable?: boolean
  }
  let {
    open = $bindable(false),
    onOpenChange,
    side,
    align,
    label,
    size,
    trigger: triggerText = 'Filters',
    focusable = true,
  }: Props = $props()
</script>

<button type="button" data-testid="before">before</button>
<Popover bind:open {onOpenChange} {side} {align} {label} {size}>
  {#snippet trigger()}{triggerText}{/snippet}
  {#if focusable}
    <button type="button" data-testid="first">first</button>
    <button type="button" data-testid="second">second</button>
  {:else}
    <p>Just text.</p>
  {/if}
</Popover>
<button type="button" data-testid="after">after</button>
<output data-testid="state">{open ? 'open' : 'closed'}</output>
<button type="button" data-testid="parent-open" onclick={() => (open = true)}>parent open</button>
