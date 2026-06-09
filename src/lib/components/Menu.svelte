<script module lang="ts">
  import type { IconName } from './Icon.svelte'

  /** One selectable row in a {@link Menu}. */
  export interface MenuItem {
    id: string
    label: string
    /** Optional leading glyph. */
    icon?: IconName
    /** Disabled rows are skipped by keyboard navigation and not selectable. */
    disabled?: boolean
    /** Marks the active/checked row (renders a check marker). */
    selected?: boolean
    /** Fired when the row is activated. */
    onSelect?: (id: string) => void
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // SCAFFOLD STUB — DS-0050 (Dropdown / Menu component).
  // Slots are wired (barrel export, COMPONENT_NAMES, token partial _menu.scss,
  // docs entry) so the real implementation lands in ONE file with no conflicts.
  // Implement: trigger + floating panel, click-outside + Esc, roving role=menu /
  // menuitem keyboard nav, aria-expanded/controls, start|end alignment.
  // ─────────────────────────────────────────────────────────────────────────
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Items rendered in the menu panel. */
    items?: MenuItem[]
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Trigger content. */
    children?: Snippet
  }

  let { items = [], size, children }: Props = $props()
</script>

<div class="ss-menu" data-size-variant={resolveComponentSize('Menu', size)}>
  {@render children?.()}
  {#if items.length}
    <ul class="panel" role="menu">
      {#each items as item (item.id)}
        <li role="menuitem" aria-disabled={item.disabled}>{item.label}</li>
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
  // TODO(DS-0050): real styling. Stub keeps tokens/zero-radius house rules.
  .ss-menu { position: relative; display: inline-block; }
  .panel { margin: 0; padding: 0; list-style: none; }
</style>
