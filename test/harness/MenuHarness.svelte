<script lang="ts">
  import Menu from '$lib/components/Menu.svelte'
  import type { MenuItem } from '$lib/components/Menu.svelte'
  import type { MenuOpenChangeDetails } from '$lib/core/menu.js'
  import type { Size } from '$lib/config.js'

  interface Props {
    items?: MenuItem[]
    open?: boolean
    onSelect?: (id: string) => void
    onOpenChange?: (open: boolean, details: MenuOpenChangeDetails) => void
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
    onOpenChange,
    align,
    side,
    label,
    size,
    trigger = 'Open menu',
  }: Props = $props()
</script>

<Menu {items} bind:open {onSelect} {onOpenChange} {align} {side} {label} {size}>{trigger}</Menu>
