<script lang="ts">
  import Tooltip from '$lib/components/Tooltip.svelte'
  import type { Size } from '$lib/config.js'

  interface Props {
    text?: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    size?: Size
    trigger?: string
    /** Render the tip from a snippet instead of the `text` string (DS-0144). */
    rich?: boolean
  }
  let { text = 'More info', placement, size, trigger = 'Help', rich = false }: Props = $props()
</script>

{#snippet richTip()}
  <strong data-testid="rich-strong">Copy path</strong>
  <code data-testid="rich-code">/srv/app</code>
{/snippet}

<Tooltip text={rich ? richTip : text} {placement} {size}>
  <button type="button">{trigger}</button>
</Tooltip>
