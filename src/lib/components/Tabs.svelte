<script module lang="ts">
  import type { IconName } from './Icon.svelte'

  /** One tab in a {@link Tabs} list. */
  export interface TabItem {
    /** Stable identifier — matched against `value` and passed to `onChange`. */
    id: string
    /** Tab text (also its accessible name, and the name of its panel). */
    label: string
    /** Optional leading glyph. */
    icon?: IconName
    /** Disabled tabs are skipped by keyboard navigation and not selectable. */
    disabled?: boolean
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Tabs — DS-0197. The WAI-ARIA tabs pattern: a `role="tablist"` that is ONE
  // tab stop (roving tabindex; arrows / Home / End, mirrored under RTL) over a
  // set of `role="tabpanel"` regions, one per tab, of which only the selected
  // one is shown. Every decision is made in `core/tabs.ts`, shared with
  // vanilla/tabs.ts.
  // ─────────────────────────────────────────────────────────────────────────
  import type { Snippet } from 'svelte'
  import Icon from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'
  import {
    tabsKey,
    tabsListAttrs,
    tabsPanelAttrs,
    tabsPress,
    tabsSelected,
    tabsTabAttrs,
    tabsTabStop,
    type TabsAction,
    type TabsActivation,
    type TabsChangeDetails,
    type TabsState,
  } from '../core/tabs.js'

  interface Props {
    /** The tabs, in order: { id, label, icon?, disabled? }. */
    tabs?: TabItem[]
    /**
     * Id of the selected tab (bindable). When it matches no tab, the first
     * enabled tab is shown.
     */
    value?: string
    /**
     * Fired when the selection changes (after `value` updates). `details.reason`
     * says what moved it: `'press'` (a tab was clicked) or `'key'` (arrows /
     * Home / End, or Enter / Space with manual activation).
     */
    onChange?: (value: string, details: TabsChangeDetails) => void
    /**
     * How the keyboard selects. `'auto'` (default): the tab that takes focus is
     * selected. `'manual'`: arrows only move focus, Enter / Space select — use
     * it when showing a panel is expensive.
     */
    activation?: TabsActivation
    /**
     * Accessible name for the tab list. Required (WCAG 2.2 AA): an unnamed
     * tablist leaves AT users without context for the choice.
     */
    label: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /**
     * Content of the selected tab's panel; receives the active tab.
     *   {#snippet panel(tab)} … {/snippet}
     */
    panel?: Snippet<[TabItem]>
  }

  let {
    tabs = [],
    value = $bindable(),
    onChange,
    activation = 'auto',
    label,
    size,
    panel,
  }: Props = $props()

  const uid = $props.id()
  const tabId = (i: number) => `${uid}-tab-${i}`
  const panelId = (i: number) => `${uid}-panel-${i}`

  let tabEls = $state<(HTMLButtonElement | undefined)[]>([])

  const enabled = $derived(tabs.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0))

  // The list's state as `core/tabs.ts` sees it.
  const list = $derived<TabsState>({
    selected: tabsSelected(
      tabs.findIndex((t) => t.id === value),
      enabled,
    ),
    enabled,
  })

  const tabStop = $derived(tabsTabStop(list))

  /** Apply a core action: move the selection and / or the focus. */
  function run(action: TabsAction | null) {
    if (!action) return
    if (action.type === 'select') {
      const tab = tabs[action.index]
      if (action.changed && tab) {
        value = tab.id
        onChange?.(tab.id, { reason: action.reason })
      }
      if (!action.focus) return
    }
    tabEls[action.index]?.focus()
  }

  function onKeydown(e: KeyboardEvent, index: number) {
    // RTL: the list is laid out right-to-left, so ArrowLeft points at the NEXT
    // tab. Read the computed direction at keydown time (it inherits from any
    // ancestor `dir`) and hand it to the core, which stays DOM-free.
    const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl'
    const result = tabsKey(list, index, e.key, { rtl, activation })
    if (!result) return
    if (result.preventDefault) e.preventDefault()
    run(result.action)
  }

  const sizeAttr = $derived(resolveComponentSize('Tabs', size))
</script>

<div class="ss-tabs" data-size-variant={sizeAttr} data-activation={activation}>
  <div class="list" aria-label={label} {...tabsListAttrs()}>
    {#each tabs as tab, i (tab.id)}
      <button
        bind:this={tabEls[i]}
        id={tabId(i)}
        type="button"
        class="tab"
        class:selected={i === list.selected}
        {...tabsTabAttrs({
          index: i,
          selected: list.selected,
          tabStop,
          panelId: panelId(i),
        })}
        disabled={tab.disabled}
        onclick={() => run(tabsPress(list, i))}
        onkeydown={(e) => onKeydown(e, i)}
      >
        {#if tab.icon}<Icon name={tab.icon} size={sizeAttr} />{/if}
        <span class="label">{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- One panel per tab (the plain-HTML contract); only the selected one is shown and filled. -->
  {#each tabs as tab, i (tab.id)}
    {@const active = i === list.selected}
    <div id={panelId(i)} class="panel" {...tabsPanelAttrs(tabId(i))} hidden={!active}>
      {#if active}{@render panel?.(tab)}{/if}
    </div>
  {/each}
</div>

<style lang="scss">
  .ss-tabs {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .list {
    display: flex;
    align-items: stretch;
    // The strip shrinks and scrolls instead of overflowing its container; focusing an
    // off-screen tab scrolls it into view natively.
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: thin;
    // The rail the selected tab's underline sits on.
    box-shadow: inset 0 -1px 0 var(--ss-line);
  }

  .tab {
    display: inline-flex;
    align-items: center;
    flex: none;
    gap: var(--ss-tabs-gap);
    min-block-size: var(--ss-s-6); // ≥24px hit target at sm
    padding: var(--ss-tabs-py) var(--ss-tabs-px);
    font: 500 var(--ss-tabs-font) var(--ss-font-mono);
    white-space: nowrap;
    color: var(--ss-fg-muted);
    background: transparent;
    border: 0;
    cursor: pointer;
    transition:
      color var(--ss-dur-fast) var(--ss-ease),
      background var(--ss-dur-fast) var(--ss-ease),
      box-shadow var(--ss-dur-fast) var(--ss-ease);

    &:hover:not(:disabled) {
      color: var(--ss-fg);
      background: var(--ss-hover);
    }

    // Selected: the Topbar treatment — full-strength text, a faint accent wash and a 2px
    // underline (the underline, not the colour, carries the state).
    &.selected {
      color: var(--ss-fg);
      background: color-mix(in srgb, var(--ss-accent) 6%, transparent);
      box-shadow: inset 0 -2px 0 var(--ss-primary);
    }

    // The base ring, pulled inside: the scrolling strip would clip an outer one.
    &:focus-visible {
      outline-offset: -2px;
    }

    &:disabled {
      color: var(--ss-fg-faint);
      cursor: not-allowed;
    }
  }

  .panel {
    padding-block: var(--ss-tabs-panel-py);
    min-width: 0;

    &[hidden] {
      display: none;
    }

    &:focus-visible {
      outline-offset: -2px;
    }
  }
</style>
