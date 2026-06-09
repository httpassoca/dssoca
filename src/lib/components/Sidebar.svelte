<script module lang="ts">
  import type { IconName } from './Icon.svelte'

  export type SideStatus = 'up' | 'deg' | 'down'
  export interface SideItem {
    id: string
    label: string
    /** Optional leading glyph. Omit for a text-only nav item. */
    icon?: IconName
    status?: SideStatus
    /** Optional URL — when set the item renders as a real `<a href>`. */
    href?: string
    /** Optional count/label rendered as a square badge near the status dot. */
    badge?: string | number
    /** One level of nested sub-items, rendered with the Disclosure pattern. */
    children?: SideItem[]
  }
  export interface SideGroup { section: string; items: SideItem[] }
</script>

<script lang="ts">
  import Icon from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    active?: string
    onSelect?: (id: string) => void
    groups?: SideGroup[]
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Collapse to an icon-only rail; labels/section text are hidden. */
    collapsed?: boolean
    /** Fired when the built-in collapse toggle is pressed. */
    onToggleCollapsed?: (collapsed: boolean) => void
  }

  const DEFAULT_GROUPS: SideGroup[] = [
    { section: 'platform', items: [
      { id: 'hub',   label: 'Hub',   icon: 'grid',     status: 'up' },
      { id: 'auth',  label: 'Auth',  icon: 'user',     status: 'up' },
      { id: 'caddy', label: 'Caddy', icon: 'settings', status: 'up' },
    ]},
    { section: 'services', items: [
      { id: 'movies',  label: 'Movies',  icon: 'film',     status: 'up' },
      { id: 'notes',   label: 'Notes',   icon: 'note',     status: 'up' },
      { id: 'tasks',   label: 'Tasks',   icon: 'check',    status: 'up' },
    ]},
  ]

  let {
    active = 'hub',
    onSelect,
    groups = DEFAULT_GROUPS,
    size,
    collapsed = false,
    onToggleCollapsed,
  }: Props = $props()

  // --- helpers ------------------------------------------------------------

  const STATUS_WORD: Record<SideStatus, string> = {
    up: '',
    deg: 'degraded',
    down: 'down',
  }

  /** Compose the accessible name so collapsed/icon-only rails and AT users
   *  keep the label, the degraded/down status, and the badge count. */
  function accessibleName(item: SideItem): string {
    const parts = [item.label]
    if (item.status && STATUS_WORD[item.status]) parts.push(STATUS_WORD[item.status])
    if (item.badge != null && item.badge !== '') parts.push(`${item.badge}`)
    return parts.join(', ')
  }

  function isActive(item: SideItem): boolean {
    return item.id === active
  }

  /** A parent disclosure is "active-within" when it or any child is active. */
  function hasActiveDescendant(item: SideItem): boolean {
    return isActive(item) || !!item.children?.some(isActive)
  }

  // Per-disclosure open state. Auto-expanded when a descendant is active;
  // user toggles override afterwards.
  let openState = $state<Record<string, boolean>>({})
  const isOpen = (item: SideItem): boolean =>
    openState[item.id] ?? hasActiveDescendant(item)

  function toggleOpen(item: SideItem) {
    openState[item.id] = !isOpen(item)
  }

  function selectIfSpa(item: SideItem, e: Event) {
    // Real links navigate natively; only intercept the SPA (no-href) path.
    if (!item.href) {
      e.preventDefault()
      onSelect?.(item.id)
    } else {
      onSelect?.(item.id)
    }
  }

  const sizeAttr = $derived(resolveComponentSize('Sidebar', size))
</script>

<nav
  class="ss-side"
  aria-label="Sidebar"
  data-size-variant={sizeAttr}
  data-collapsed={collapsed ? '' : undefined}
>
  {#if onToggleCollapsed}
    <button
      type="button"
      class="rail-toggle"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-pressed={collapsed}
      onclick={() => onToggleCollapsed?.(!collapsed)}
    >
      <Icon name="arrow" px={13} />
    </button>
  {/if}

  {#each groups as g, gi}
    {@const labelId = `ss-side-sec-${gi}`}
    <div class="section" id={labelId}>{g.section}</div>
    <ul class="list" aria-labelledby={labelId}>
      {#each g.items as item}
        <li class="row">
          {#if item.children?.length}
            {@const open = isOpen(item)}
            {@const panelId = `ss-side-sub-${item.id}`}
            <button
              type="button"
              class="item disclosure {hasActiveDescendant(item) ? 'active' : ''}"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={collapsed ? accessibleName(item) : undefined}
              title={collapsed ? accessibleName(item) : undefined}
              onclick={() => toggleOpen(item)}
            >
              {#if item.icon}<Icon name={item.icon} px={13} />{/if}
              <span class="label">{item.label}</span>
              {#if item.badge != null && item.badge !== ''}
                <span class="badge">{item.badge}</span>
              {/if}
              {#if item.status}
                <span
                  class="dot {item.status === 'deg' ? 'warn' : item.status === 'down' ? 'err' : ''}"
                  aria-hidden="true"
                ></span>
              {/if}
              <span class="caret {open ? 'open' : ''}" aria-hidden="true"></span>
            </button>
            <ul class="sublist" id={panelId} aria-label={item.label} hidden={!open}>
              {#each item.children as child}
                <li class="row">
                  {#if child.href}
                    <a
                      class="item child {isActive(child) ? 'active' : ''}"
                      href={child.href}
                      aria-current={isActive(child) ? 'page' : undefined}
                      aria-label={collapsed ? accessibleName(child) : undefined}
                      title={collapsed ? accessibleName(child) : undefined}
                      onclick={(e) => selectIfSpa(child, e)}
                    >
                      {#if child.icon}<Icon name={child.icon} px={13} />{/if}
                      <span class="label">{child.label}</span>
                      {#if child.badge != null && child.badge !== ''}
                        <span class="badge">{child.badge}</span>
                      {/if}
                      {#if child.status}
                        <span
                          class="dot {child.status === 'deg' ? 'warn' : child.status === 'down' ? 'err' : ''}"
                          aria-hidden="true"
                        ></span>
                      {/if}
                    </a>
                  {:else}
                    <div
                      class="item child {isActive(child) ? 'active' : ''}"
                      role="button"
                      tabindex="0"
                      aria-current={isActive(child) ? 'page' : undefined}
                      aria-label={collapsed ? accessibleName(child) : undefined}
                      title={collapsed ? accessibleName(child) : undefined}
                      onclick={() => onSelect?.(child.id)}
                      onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(child.id) }
                      }}
                    >
                      {#if child.icon}<Icon name={child.icon} px={13} />{/if}
                      <span class="label">{child.label}</span>
                      {#if child.badge != null && child.badge !== ''}
                        <span class="badge">{child.badge}</span>
                      {/if}
                      {#if child.status}
                        <span
                          class="dot {child.status === 'deg' ? 'warn' : child.status === 'down' ? 'err' : ''}"
                          aria-hidden="true"
                        ></span>
                      {/if}
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {:else if item.href}
            <a
              class="item {isActive(item) ? 'active' : ''}"
              href={item.href}
              aria-current={isActive(item) ? 'page' : undefined}
              aria-label={collapsed ? accessibleName(item) : undefined}
              title={collapsed ? accessibleName(item) : undefined}
              onclick={(e) => selectIfSpa(item, e)}
            >
              {#if item.icon}<Icon name={item.icon} px={13} />{/if}
              <span class="label">{item.label}</span>
              {#if item.badge != null && item.badge !== ''}
                <span class="badge">{item.badge}</span>
              {/if}
              {#if item.status}
                <span
                  class="dot {item.status === 'deg' ? 'warn' : item.status === 'down' ? 'err' : ''}"
                  aria-hidden="true"
                ></span>
              {/if}
            </a>
          {:else}
            <div
              class="item {isActive(item) ? 'active' : ''}"
              role="button"
              tabindex="0"
              aria-current={isActive(item) ? 'page' : undefined}
              aria-label={collapsed ? accessibleName(item) : undefined}
              title={collapsed ? accessibleName(item) : undefined}
              onclick={() => onSelect?.(item.id)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(item.id) }
              }}
            >
              {#if item.icon}<Icon name={item.icon} px={13} />{/if}
              <span class="label">{item.label}</span>
              {#if item.badge != null && item.badge !== ''}
                <span class="badge">{item.badge}</span>
              {/if}
              {#if item.status}
                <span
                  class="dot {item.status === 'deg' ? 'warn' : item.status === 'down' ? 'err' : ''}"
                  aria-hidden="true"
                ></span>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/each}
</nav>

<style lang="scss">
  .ss-side {
    border-right: 1px solid var(--ss-line);
    padding: var(--ss-gap) var(--ss-s-1);
    display: flex; flex-direction: column; gap: 1px;
    background: var(--ss-bg);
    width: var(--ss-side-w);
    // Fill the host container's height so the rail (border-right + background)
    // spans the full screen/column instead of stopping at the last item. Uses
    // min-height so it still grows past the viewport when the nav is long (the
    // host scrolls). A percentage min-height against an indefinite-height parent
    // imposes no constraint (effectively 0), so a bare/standalone Sidebar falls
    // back to its content height and is unaffected.
    min-height: 100%;
    transition: width var(--ss-dur-fast) var(--ss-ease);

    &[data-collapsed] {
      width: var(--ss-side-w-rail);

      .section { text-indent: -9999px; height: 1px; padding: 0; overflow: hidden; }
      .label, .badge, .caret { display: none; }
      .item { justify-content: center; gap: 0; }
      .dot { margin-left: 0; }
      .sublist { padding-left: 0; }
    }

    .list, .sublist {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column; gap: 1px;
    }
    .sublist { padding-left: var(--ss-s-3); }
    .row { display: block; }

    .rail-toggle {
      display: flex; align-items: center; justify-content: center;
      background: none; border: 0; cursor: pointer;
      color: var(--ss-fg-faint);
      padding: var(--ss-row-py) var(--ss-row-px);
      margin-bottom: var(--ss-s-1);
      transition: color var(--ss-dur-fast) var(--ss-ease);
      &:hover { color: var(--ss-fg); }
    }

    .section {
      font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint); text-transform: uppercase; letter-spacing: 0.12em;
      padding: var(--ss-row-px) var(--ss-row-px) var(--ss-s-1);
    }

    .item {
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: var(--ss-row-py) var(--ss-row-px); cursor: pointer; color: var(--ss-fg-muted);
      font: 500 var(--ss-ui-md) var(--ss-font-mono);
      border-left: 2px solid transparent;
      border-top: 0; border-right: 0; border-bottom: 0;
      background: none; text-align: left; text-decoration: none;
      box-sizing: border-box;
      transition: all var(--ss-dur-fast) var(--ss-ease);

      &:hover { color: var(--ss-fg); background: var(--ss-hover); }
      &.active { color: var(--ss-fg); background: rgba(var(--ss-primary-rgb), .06); border-left-color: var(--ss-primary); }

      .label { flex: 1 1 auto; min-width: 0; }

      .badge {
        flex: 0 0 auto; margin-left: auto;
        font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs); line-height: 1;
        color: var(--ss-fg-muted); background: var(--ss-hover);
        border: 1px solid var(--ss-line);
        padding: var(--ss-side-badge-py) var(--ss-side-badge-px);
        border-radius: 0;
      }
      .badge + .dot { margin-left: var(--ss-s-1); }

      .dot {
        flex: 0 0 auto;
        width: 5px; height: 5px; margin-left: auto; background: var(--ss-primary);
        &.warn { background: var(--ss-yellow); }
        &.err  { background: var(--ss-red); }
      }

      .caret {
        flex: 0 0 auto; margin-left: var(--ss-s-1);
        width: 0; height: 0;
        border-left: 4px solid currentColor;
        border-top: 3px solid transparent;
        border-bottom: 3px solid transparent;
        transition: transform var(--ss-dur-fast) var(--ss-ease);
        &.open { transform: rotate(90deg); }
      }
      .badge + .caret, .dot + .caret { margin-left: var(--ss-s-1); }
    }

    .item.child {
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-faint);
      &:hover { color: var(--ss-fg); }
    }
  }
</style>
