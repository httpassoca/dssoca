<script lang="ts">
  import Topbar from '$lib/components/Topbar.svelte'

  interface Props {
    withBrand?: boolean
    withUserMenu?: boolean
    onCommand?: () => void
    onUser?: () => void
    active?: string
    tabs?: string[]
    sticky?: boolean
    skipTarget?: string
    stats?: { key: string; value: string; title?: string }[]
  }
  let {
    withBrand = false,
    withUserMenu = false,
    onCommand,
    onUser,
    active,
    tabs,
    sticky,
    skipTarget,
    stats,
  }: Props = $props()
</script>

{#if withBrand && withUserMenu}
  <Topbar {onCommand} {onUser} {active} {tabs} {sticky} {skipTarget} {stats}>
    {#snippet brand()}<span class="custom-brand">acme</span>{/snippet}
    {#snippet userMenu()}<button class="custom-user">menu</button>{/snippet}
  </Topbar>
{:else if withBrand}
  <Topbar {onCommand} {onUser} {active} {tabs} {sticky} {skipTarget} {stats}>
    {#snippet brand()}<span class="custom-brand">acme</span>{/snippet}
  </Topbar>
{:else if withUserMenu}
  <Topbar {onCommand} {onUser} {active} {tabs} {sticky} {skipTarget} {stats}>
    {#snippet userMenu()}<button class="custom-user">menu</button>{/snippet}
  </Topbar>
{:else}
  <Topbar {onCommand} {onUser} {active} {tabs} {sticky} {skipTarget} {stats} />
{/if}
