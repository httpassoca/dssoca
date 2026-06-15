<script lang="ts">
  import Tooltip from '$lib/components/Tooltip.svelte'
  import type { Size } from '$lib/config.js'

  interface Props {
    text?: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    size?: Size
    trigger?: string
  }
  let { text = 'More info', placement, size, trigger = 'Help' }: Props = $props()
</script>

<Tooltip {text} {placement} {size}>
  <button type="button">{trigger}</button>
</Tooltip>
