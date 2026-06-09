<script module lang="ts">
  import type { IconName } from './Icon.svelte'

  /** One tab in the bottom navigation bar. */
  export interface BottomNavItem {
    /** Stable id — matched against `active` and passed to `onSelect`. */
    id: string
    /** Visible label rendered under the icon. */
    label: string
    /** Leading glyph (shared `Icon` component). */
    icon: IconName
    /** Optional URL — when set the tab renders as a real `<a href>`. */
    href?: string
    /** Optional count/label rendered as a small square badge on the icon. */
    badge?: string | number
  }
</script>

<script lang="ts">
  import Icon from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Tabs to render, left → right, in equal-width columns. */
    items?: BottomNavItem[]
    /** Id of the active tab; highlighted + `aria-current="page"`. */
    active?: string
    /** Fired with the tab id on activation (also fires for `href` tabs as an SPA fallback). */
    onSelect?: (id: string) => void
    /** Accessible name for the wrapping `<nav>` landmark. */
    ariaLabel?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  const DEFAULT_ITEMS: BottomNavItem[] = [
    { id: 'home',     label: 'Home',     icon: 'grid' },
    { id: 'services', label: 'Services', icon: 'flex' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'account',  label: 'Account',  icon: 'user' },
  ]

  let {
    items = DEFAULT_ITEMS,
    active,
    onSelect,
    ariaLabel = 'Primary',
    size,
  }: Props = $props()

  const isActive = (item: BottomNavItem): boolean => item.id === active

  const hasBadge = (item: BottomNavItem): boolean =>
    item.badge != null && item.badge !== ''

  /** Fold the count badge into the accessible name so it isn't lost to AT. */
  function accessibleName(item: BottomNavItem): string {
    return hasBadge(item) ? `${item.label}, ${item.badge}` : item.label
  }

  function activate(item: BottomNavItem, e: MouseEvent) {
    // Real links navigate natively; intercept only the SPA (no-href) path so a
    // plain <button> never submits/scrolls. onSelect fires either way.
    if (!item.href) e.preventDefault()
    onSelect?.(item.id)
  }

  const sizeAttr = $derived(resolveComponentSize('BottomNav', size))
</script>

<nav class="ss-bottom-nav" aria-label={ariaLabel} data-size-variant={sizeAttr}>
  <ul class="list">
    {#each items as item (item.id)}
      {@const current = isActive(item)}
      <li class="row">
        {#if item.href}
          <a
            class="tab {current ? 'active' : ''}"
            href={item.href}
            aria-current={current ? 'page' : undefined}
            aria-label={hasBadge(item) ? accessibleName(item) : undefined}
            onclick={(e) => activate(item, e)}
          >
            <span class="glyph">
              <Icon name={item.icon} px={20} />
              {#if hasBadge(item)}
                <span class="badge" aria-hidden="true">{item.badge}</span>
              {/if}
            </span>
            <span class="label">{item.label}</span>
          </a>
        {:else}
          <button
            type="button"
            class="tab {current ? 'active' : ''}"
            aria-current={current ? 'page' : undefined}
            aria-label={hasBadge(item) ? accessibleName(item) : undefined}
            onclick={(e) => activate(item, e)}
          >
            <span class="glyph">
              <Icon name={item.icon} px={20} />
              {#if hasBadge(item)}
                <span class="badge" aria-hidden="true">{item.badge}</span>
              {/if}
            </span>
            <span class="label">{item.label}</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style lang="scss">
  .ss-bottom-nav {
    // --- local token fallbacks ----------------------------------------------
    // Authored source of truth lives in src/styles/components/_bottom-nav.scss;
    // these fallbacks keep the bar self-contained and rescaling even when the
    // global partial isn't present, reusing the shell/icon/ui scale tokens.
    --_bar-h: var(--ss-bottom-nav-h, var(--ss-shell-top-h, 48px));
    --_pad-x: var(--ss-bottom-nav-px, var(--ss-s-2, 8px));
    --_tab-py: var(--ss-bottom-nav-tab-py, var(--ss-s-1, 4px));
    --_gap: var(--ss-bottom-nav-gap, 4px);
    --_label-fs: var(--ss-bottom-nav-label-fs, var(--ss-ui-xs, 11px));

    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 30;
    box-sizing: border-box;
    // Safe-area: reserve the device inset below the bar (notch/home indicator).
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: color-mix(in srgb, var(--ss-bg) 88%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-top: 1px solid var(--ss-line);
    font-family: var(--ss-font-mono);

    .list {
      list-style: none; margin: 0; padding: 0;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr; // equal-width columns
      align-items: stretch;
    }
    .row { display: flex; }

    .tab {
      flex: 1 1 auto;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: var(--_gap);
      width: 100%;
      // Bar height + ≥44px hit target (WCAG 2.5.8) at md/lg.
      min-height: max(var(--_bar-h), 44px);
      padding: var(--_tab-py) var(--_pad-x);
      box-sizing: border-box;
      cursor: pointer;
      text-decoration: none;
      color: var(--ss-fg-faint);
      background: none;
      border: 0;
      border-top: 2px solid transparent; // active accent rail (zero radius)
      font: inherit;
      transition:
        color var(--ss-dur-fast) var(--ss-ease),
        background var(--ss-dur-fast) var(--ss-ease);

      &:hover { color: var(--ss-fg); }
      &:focus-visible {
        outline: 2px solid var(--ss-primary);
        outline-offset: -2px;
      }

      &.active {
        color: var(--ss-primary);
        background: rgba(var(--ss-primary-rgb), .06);
        border-top-color: var(--ss-primary);
      }
    }

    .glyph {
      position: relative;
      display: inline-flex;
      align-items: center; justify-content: center;
      line-height: 0;
    }

    .badge {
      position: absolute;
      top: -6px; left: calc(50% + 6px);
      min-width: 14px; height: 14px;
      padding: 0 3px;
      box-sizing: border-box;
      display: inline-flex; align-items: center; justify-content: center;
      font-family: var(--ss-font-mono);
      font-size: 9px; line-height: 1;
      font-variant-numeric: tabular-nums;
      color: var(--ss-fg-on-primary, #001b04);
      background: var(--ss-primary);
      border-radius: 0;
    }

    .label {
      font-size: var(--_label-fs);
      line-height: 1;
      letter-spacing: 0.02em;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      .tab { transition: none; }
    }
  }
</style>
