<script lang="ts">
  // DS-0159 — TierList harness: forwards the props and optionally renders a custom
  // `tile` snippet (a marker element per item) so tests can pin the snippet contract.
  import TierList, {
    type TierListItem,
    type TierListPlacements,
    type TierListTier,
  } from '$lib/components/TierList.svelte'
  import type { Size } from '$lib/config'

  interface Props {
    tiers?: TierListTier[]
    items?: TierListItem[]
    placements?: TierListPlacements
    onchange?: (p: TierListPlacements) => void
    onselect?: (item: TierListItem) => void
    tray?: string | false
    label?: string
    readonly?: boolean
    size?: Size
    customTile?: boolean
  }

  const DEFAULT_ITEMS: TierListItem[] = [
    { id: 'alpha', label: 'Alpha' },
    { id: 'beta', label: 'Beta' },
    { id: 'gamma', label: 'Gamma' },
    { id: 'delta', label: 'Delta' },
  ]

  let {
    tiers,
    items = DEFAULT_ITEMS,
    placements = $bindable(),
    onchange,
    onselect,
    tray,
    label,
    readonly,
    size,
    customTile = false,
  }: Props = $props()
</script>

{#if customTile}
  <TierList {tiers} {items} bind:placements {onchange} {onselect} {tray} {label} {readonly} {size}>
    {#snippet tile(item)}
      <span class="custom-tile" data-for={item.id}>★ {item.label}</span>
    {/snippet}
  </TierList>
{:else}
  <TierList
    {tiers}
    {items}
    bind:placements
    {onchange}
    {onselect}
    {tray}
    {label}
    {readonly}
    {size}
  />
{/if}

<!-- The bound value, readable by tests (Svelte 5 exposes no prop accessors). -->
<output data-testid="placements">{JSON.stringify(placements ?? null)}</output>
