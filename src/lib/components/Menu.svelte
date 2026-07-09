<script module lang="ts">
  import type { Snippet } from 'svelte'
  import type { IconName } from './Icon.svelte'

  /**
   * One selectable row in a {@link Menu}.
   *
   * Leading visual (decorative; the `label` carries the semantics). When more
   * than one is set, precedence is `leading` → `swatch` → `emoji` → `icon`.
   */
  export interface MenuItem {
    id: string
    label: string
    /** Optional leading glyph. */
    icon?: IconName
    /**
     * Custom leading content as a Svelte 5 snippet — arbitrary markup rendered
     * in the icon slot (aria-hidden; keep it decorative).
     */
    leading?: Snippet
    /**
     * Convenience leading visual: any CSS color, rendered as a token-sized
     * square color chip (zero radius) — e.g. a theme-picker swatch.
     */
    swatch?: string
    /**
     * Convenience leading visual: a text glyph (e.g. an emoji flag for a
     * language picker), rendered in the icon slot.
     */
    emoji?: string
    /** Disabled rows are skipped by keyboard navigation and not selectable. */
    disabled?: boolean
    /** Marks the active/checked row (renders a check marker, `aria-checked`). */
    selected?: boolean
    /** Fired when the row is activated. */
    onSelect?: (id: string) => void
  }
</script>

<script lang="ts">
  import Icon from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  /** Where the panel attaches relative to the trigger. */
  type Align = 'start' | 'end'
  type Side = 'bottom' | 'top'

  interface Props {
    /** Items rendered in the menu panel. */
    items?: MenuItem[]
    /**
     * Open state. `bindable` so callers can control it; left alone it behaves
     * as an uncontrolled menu (toggled internally by the trigger / dismissal).
     */
    open?: boolean
    /** Fired when an item is activated, with its `id` (after `item.onSelect`). */
    onSelect?: (id: string) => void
    /** Horizontal edge the panel aligns to. */
    align?: Align
    /** Vertical side the panel opens toward. */
    side?: Side
    /**
     * Accessible label for the panel (`role="menu"`). Falls back to the
     * trigger's text when omitted.
     */
    label?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Trigger content (rendered inside the toggle button). */
    children?: Snippet
  }

  let {
    items = [],
    open = $bindable(false),
    onSelect,
    align = 'start',
    side = 'bottom',
    label,
    size,
    children,
  }: Props = $props()

  const uid = $props.id()
  const panelId = `${uid}-panel`

  // When any item carries a `selected` flag the menu is a selection group, so
  // rows become `menuitemradio` + `aria-checked` (WAI-ARIA). Otherwise plain
  // `menuitem` action rows.
  const selectable = $derived(items.some((i) => i.selected !== undefined))

  let triggerEl = $state<HTMLButtonElement>()
  let panelEl = $state<HTMLElement>()
  // The roving focus index into the *enabled* items; -1 when none focused yet.
  let activeIndex = $state(-1)

  const enabledIndexes = $derived(
    items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0),
  )

  function focusItem(domIndex: number) {
    activeIndex = domIndex
    const el = panelEl?.querySelector<HTMLElement>(`[data-mi="${domIndex}"]`)
    el?.focus()
  }

  function firstEnabled(): number {
    return enabledIndexes[0] ?? -1
  }
  function lastEnabled(): number {
    return enabledIndexes[enabledIndexes.length - 1] ?? -1
  }
  function nextEnabled(from: number): number {
    const after = enabledIndexes.find((i) => i > from)
    return after ?? firstEnabled()
  }
  function prevEnabled(from: number): number {
    const before = [...enabledIndexes].reverse().find((i) => i < from)
    return before ?? lastEnabled()
  }

  function openMenu(focus: 'first' | 'last' = 'first') {
    if (open) return
    open = true
    // Defer focus until the panel renders.
    queueMicrotask(() => focusItem(focus === 'first' ? firstEnabled() : lastEnabled()))
  }

  function closeMenu(returnFocus = true) {
    if (!open) return
    open = false
    activeIndex = -1
    if (returnFocus) triggerEl?.focus()
  }

  function toggle() {
    if (open) closeMenu()
    else openMenu('first')
  }

  function activate(item: MenuItem) {
    if (item.disabled) return
    item.onSelect?.(item.id)
    onSelect?.(item.id)
    closeMenu()
  }

  function onTriggerKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      openMenu('first')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu('last')
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu('first')
    }
  }

  function onPanelKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusItem(activeIndex < 0 ? firstEnabled() : nextEnabled(activeIndex))
        break
      case 'ArrowUp':
        e.preventDefault()
        focusItem(activeIndex < 0 ? lastEnabled() : prevEnabled(activeIndex))
        break
      case 'Home':
        e.preventDefault()
        focusItem(firstEnabled())
        break
      case 'End':
        e.preventDefault()
        focusItem(lastEnabled())
        break
      case 'Escape':
        e.preventDefault()
        closeMenu()
        break
      case 'Tab':
        // Tabbing out dismisses the menu (focus moves naturally; don't trap).
        closeMenu(false)
        break
    }
  }

  // Pointer-down outside the root closes the menu (click would fire after the
  // outside target already handled the event; pointerdown matches the website).
  function onDocPointerDown(e: PointerEvent) {
    if (!open) return
    const t = e.target as Node
    // DS-0067 / DS-0078: triggerEl/panelEl may be unbound (pre-mount, SSR-ish
    // eager evaluation) — null-check before .contains().
    if (triggerEl && triggerEl.contains(t)) return
    if (panelEl && panelEl.contains(t)) return
    closeMenu(false)
  }

  // SSR safety (DS-0067): same guard pattern as toast.svelte.ts — effects
  // normally don't run on the server, but the guard is the house convention
  // and protects against eager evaluation.
  const hasDocument = typeof document !== 'undefined'

  $effect(() => {
    if (!open || !hasDocument) return
    document.addEventListener('pointerdown', onDocPointerDown, true)
    return () => document.removeEventListener('pointerdown', onDocPointerDown, true)
  })

  const sizeAttr = $derived(resolveComponentSize('Menu', size))
</script>

<div class="ss-menu" data-size-variant={sizeAttr} data-align={align} data-side={side}>
  <button
    bind:this={triggerEl}
    type="button"
    class="trigger"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={panelId}
    onclick={toggle}
    onkeydown={onTriggerKeydown}
  >
    {@render children?.()}
  </button>

  <div
    bind:this={panelEl}
    id={panelId}
    class="panel"
    class:open
    role="menu"
    aria-label={label}
    aria-hidden={!open}
    tabindex="-1"
    onkeydown={onPanelKeydown}
  >
    {#each items as item, i (item.id)}
      <button
        type="button"
        class="item"
        class:selected={item.selected}
        data-mi={i}
        role={selectable ? 'menuitemradio' : 'menuitem'}
        aria-checked={selectable ? Boolean(item.selected) : undefined}
        aria-disabled={item.disabled ? 'true' : undefined}
        disabled={item.disabled}
        tabindex={i === activeIndex ? 0 : -1}
        onclick={() => activate(item)}
      >
        {#if item.leading}
          <span class="lead" aria-hidden="true">{@render item.leading()}</span>
        {:else if item.swatch}
          <span class="lead swatch" style="background:{item.swatch}" aria-hidden="true"></span>
        {:else if item.emoji}
          <span class="lead emoji" aria-hidden="true">{item.emoji}</span>
        {:else if item.icon}
          <Icon name={item.icon} />
        {/if}
        <span class="label">{item.label}</span>
        <span class="marker" aria-hidden="true"
          >{#if item.selected}<Icon name="check" />{/if}</span
        >
      </button>
    {/each}
  </div>
</div>

<style lang="scss">
  .ss-menu {
    position: relative;
    display: inline-block;
  }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-gap-sm);
    font: 500 var(--ss-control-font) var(--ss-font-mono);
    color: var(--ss-fg);
    background: transparent;
    border: 1px solid var(--ss-line);
    padding: var(--ss-control-py) var(--ss-control-px);
    cursor: pointer;
    transition:
      border-color var(--ss-dur-fast) var(--ss-ease),
      background var(--ss-dur-fast) var(--ss-ease),
      color var(--ss-dur-fast) var(--ss-ease);

    &:hover {
      border-color: var(--ss-line-strong);
      background: var(--ss-hover);
    }
    &:focus-visible {
      outline: none;
      border-color: var(--ss-primary);
      box-shadow: 0 0 0 3px var(--ss-primary-soft);
    }
  }

  .panel {
    position: absolute;
    z-index: 50;
    min-width: var(--ss-menu-min-w);
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: var(--ss-menu-pad);
    background: var(--ss-bg-elev);
    border: 1px solid var(--ss-line);
    box-shadow: var(--ss-shadow-pop);

    // Closed → invisible and inert (matches the website's scale/fade popover).
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-6px) scale(0.98);
    transition:
      opacity var(--ss-dur) var(--ss-ease),
      transform var(--ss-dur) var(--ss-ease),
      visibility 0s linear var(--ss-dur);

    &.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0) scale(1);
      transition:
        opacity var(--ss-dur) var(--ss-ease),
        transform var(--ss-dur) var(--ss-ease),
        visibility 0s linear 0s;
    }
  }

  // --- placement ------------------------------------------------------------
  .ss-menu[data-side='bottom'] .panel {
    top: calc(100% + var(--ss-menu-offset));
    transform-origin: top;
  }
  .ss-menu[data-side='top'] .panel {
    bottom: calc(100% + var(--ss-menu-offset));
    transform-origin: bottom;
  }
  .ss-menu[data-side='top'] .panel:not(.open) {
    transform: translateY(6px) scale(0.98);
  }
  .ss-menu[data-align='start'] .panel {
    left: 0;
  }
  .ss-menu[data-align='end'] .panel {
    right: 0;
  }

  .item {
    display: flex;
    align-items: center;
    gap: var(--ss-menu-item-gap);
    width: 100%;
    text-align: left;
    font: 500 var(--ss-ui-md) var(--ss-font-mono);
    color: var(--ss-fg-muted);
    background: transparent;
    border: none;
    padding: var(--ss-menu-item-py) var(--ss-menu-item-px);
    cursor: pointer;
    transition:
      background var(--ss-dur-fast) var(--ss-ease),
      color var(--ss-dur-fast) var(--ss-ease);

    &:hover {
      color: var(--ss-fg);
      background: var(--ss-hover);
    }
    &:focus-visible {
      outline: none;
      color: var(--ss-fg);
      background: var(--ss-hover);
      box-shadow: inset 2px 0 0 0 var(--ss-primary);
    }
    &.selected {
      color: var(--ss-fg);
      background: color-mix(in srgb, var(--ss-accent) 6%, transparent);
    }
    &:disabled,
    &[aria-disabled='true'] {
      color: var(--ss-fg-faint);
      cursor: not-allowed;
      &:hover {
        background: transparent;
        color: var(--ss-fg-faint);
      }
    }

    // Custom leading visual slot — same --ss-icon footprint as an <Icon>, so
    // mixed menus (icon + swatch + emoji rows) keep their labels aligned.
    .lead {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--ss-icon);
      height: var(--ss-icon);
    }

    // Square color chip (zero radius — house rule). The hairline keeps
    // low-contrast swatches visible against the panel background.
    .lead.swatch {
      border: 1px solid var(--ss-line);
    }

    .lead.emoji {
      font-size: var(--ss-icon);
      line-height: 1;
    }

    .label {
      flex: 1 1 auto;
      min-width: 0;
    }

    // Reserve room for the check marker so labels align with/without selection.
    .marker {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--ss-icon);
      color: var(--ss-primary);
    }
  }
</style>
