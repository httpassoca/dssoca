<script module lang="ts">
  import type { IconName } from './Icon.svelte'

  /** One tab in a {@link BottomNav}. */
  export interface BottomNavItem {
    id: string
    label: string
    icon: IconName
    /** Optional URL — renders the tab as a real `<a href>`. */
    href?: string
    /** Optional count/label rendered as a small badge. */
    badge?: string | number
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // SCAFFOLD STUB — DS-0054 (BottomNav component).
  // Implement: fixed bottom tab bar (equal-width icon+label tabs), active
  // highlight + aria-current=page, elevated/blurred bg from shell size token,
  // env(safe-area-inset-bottom) padding, ≥44px touch targets, nav aria-label.
  // ─────────────────────────────────────────────────────────────────────────
  import Icon from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Tabs to render. */
    items?: BottomNavItem[]
    /** Active tab id. */
    active?: string
    /** Fired when a tab is selected. */
    onSelect?: (id: string) => void
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let { items = [], active, onSelect, size }: Props = $props()
</script>

<nav
  class="ss-bottom-nav"
  aria-label="Primary"
  data-size-variant={resolveComponentSize('BottomNav', size)}
>
  {#each items as item (item.id)}
    <button
      type="button"
      aria-current={active === item.id ? 'page' : undefined}
      onclick={() => onSelect?.(item.id)}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </button>
  {/each}
</nav>

<style lang="scss">
  // TODO(DS-0054): fixed shell + active/safe-area styling.
  .ss-bottom-nav { display: flex; }
</style>
