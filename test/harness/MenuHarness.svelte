<script lang="ts">
  import Menu from '$lib/components/Menu.svelte'
  import type { MenuItem } from '$lib/components/Menu.svelte'
  import type { Size } from '$lib/config.js'

  interface Props {
    items?: MenuItem[]
    open?: boolean
    onSelect?: (id: string) => void
    align?: 'start' | 'end'
    side?: 'bottom' | 'top'
    label?: string
    size?: Size
    trigger?: string
  }
  let {
    items = [],
    open = $bindable(false),
    onSelect,
    align,
    side,
    label,
    size,
    trigger = 'Open menu',
  }: Props = $props()
</script>

<Menu {items} bind:open {onSelect} {align} {side} {label} {size}>{trigger}</Menu>
