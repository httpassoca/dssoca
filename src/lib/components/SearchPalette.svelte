<script module lang="ts">
  export interface SearchPaletteItem {
    /** Stable unique id (keys the option and its DOM id). */
    id: string
    /** Primary text; also the default filter haystack. */
    label: string
    /** Secondary muted line under the label (default row rendering). */
    hint?: string
    /** When set, the option renders as a real <a>; Enter clicks it so routing stays native. */
    href?: string
    /** Group heading; groups render in first-appearance order, ungrouped items first. */
    group?: string
    /** Extra strings matched by the internal filter. */
    keywords?: string[]
    /** Rendered but not selectable; skipped by keyboard navigation. */
    disabled?: boolean
  }
</script>

<script lang="ts" generics="T extends SearchPaletteItem">
  // ─────────────────────────────────────────────────────────────────────────
  // SearchPalette (DS-0133). A Cmd/Ctrl+K search palette: modal combobox over
  // a grouped listbox, generalized from passoca's app implementation.
  //
  // Built on the native <dialog> like Modal (DS-0094): showModal() gives us
  // the focus trap, Esc-to-close (cancel → close), ::backdrop and top layer.
  // Focus stays on the input the whole time (APG combobox pattern): options
  // are referenced via aria-activedescendant, never DOM-focused.
  //
  // Enter on an item with `href` clicks the actually-rendered <a> instead of
  // synthesizing navigation, so SvelteKit (or any router) intercepts it the
  // same way as a pointer click.
  //
  // Component metrics are inline var(--ss-search-palette-*, fallback) so no
  // global SCSS is touched (DS-0094 pattern).
  // ─────────────────────────────────────────────────────────────────────────
  import { tick, type Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'
  import { shortcuts } from '../shortcuts.svelte.js'
  import { lockScroll, unlockScroll } from '../vanilla/modal.js'
  import {
    searchBackdropPress,
    searchClosePress,
    searchFilter,
    searchFirstActive,
    searchFlat,
    searchGroups,
    searchHover,
    searchInputAttrs,
    searchInputKey,
    searchItemPress,
    searchOptionAttrs,
    searchShortcut,
    searchStatus,
    searchValidActive,
    type SearchPaletteAction,
    type SearchPaletteOpenDetails,
    type SearchPaletteReason,
    type SearchPaletteState,
  } from '../core/search-palette.js'

  interface Props {
    /** Whether the palette is shown. Bindable — sync it from caller state. */
    open?: boolean
    /** Entries to show. With external filtering, pass the already-filtered list. */
    items: T[]
    /** Search text. Bindable — bind it when you own filtering (`filter={false}`). */
    query?: string
    /** Internal substring filter over label+keywords. Set false when the consumer filters. @default true */
    filter?: boolean
    /** Global toggle shortcut, registered through the shortcut registry as
     *  `ss:search-palette` (DS-0139) — listed in ShortcutsHelp, obeys
     *  `setEnabled`/`remap`. 'mod+k' = Cmd+K on mac, Ctrl+K elsewhere
     *  (platform modifier only); false disables. @default 'mod+k' */
    shortcut?: 'mod+k' | false
    /** Input placeholder. @default 'Search…' */
    placeholder?: string
    /** Accessible name for the dialog, input and listbox. @default 'Search' */
    'aria-label'?: string
    /** No-results text (used when the `empty` snippet is absent). @default 'No results' */
    emptyText?: string
    /** Screen-reader announcement of the result count while a query is typed.
     *  @default (n) => `${n} result(s)` */
    resultsText?: (count: number) => string
    /** Accessible name of the close button (shown on small, full-screen viewports). @default 'Close' */
    closeLabel?: string
    /** Footer hint row; false hides it. A `footer` snippet replaces it. @default '↑↓ navigate · ↵ open · esc close' */
    footerText?: string | false
    /** Clear the query and selection when the palette closes. @default true */
    resetOnClose?: boolean
    /** Token size (sm|md|lg); controls the panel width. Inherits the global size when unset. */
    size?: Size
    /** Called with the chosen item on Enter/click. Return false to keep the palette open. */
    onselect?: (item: T) => void | boolean
    /** Called after the palette opens, with why (`details.reason`: shortcut · prop). */
    onopen?: (details: SearchPaletteOpenDetails) => void
    /** Called after the palette closes, with why (`details.reason`: escape · backdrop ·
     *  close-button · select · shortcut · prop). */
    onclose?: (details: SearchPaletteOpenDetails) => void
    /** Replaces the default option row body (label + hint). */
    item?: Snippet<[T, { active: boolean }]>
    /** Replaces the default no-results state; receives the current query. */
    empty?: Snippet<[string]>
    /** Replaces the footer text row. */
    footer?: Snippet
  }

  let {
    open = $bindable(false),
    items,
    query = $bindable(''),
    filter = true,
    shortcut = 'mod+k',
    placeholder = 'Search…',
    'aria-label': ariaLabel = 'Search',
    emptyText = 'No results',
    resultsText = (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`,
    closeLabel = 'Close',
    footerText = '↑↓ navigate · ↵ open · esc close',
    resetOnClose = true,
    size,
    onselect,
    onopen,
    onclose,
    item: itemSnippet,
    empty,
    footer,
  }: Props = $props()

  let dialog = $state<HTMLDialogElement | null>(null)
  let input = $state<HTMLInputElement | null>(null)
  let list = $state<HTMLElement | null>(null)
  let active = $state(0)

  const uid = $props.id()
  const listId = `${uid}-listbox`
  const optionId = (index: number) => `${uid}-option-${index}`

  // Behaviour lives in `core/search-palette.ts`: filtering, grouping, the active-option
  // movement, what a key does and why the palette opens/closes are decided there; this
  // file holds the state and applies the result.
  const filtered = $derived(filter ? searchFilter(items, query) : items)

  // Buckets in first-appearance order, ungrouped (label null) always first;
  // options carry a flat index so keyboard order equals DOM order.
  const groups = $derived(searchGroups(filtered))
  const flat = $derived(searchFlat(groups))

  const palette = $derived<SearchPaletteState>({ open, active, items: flat })

  // Why the next open/close happens. Set when the palette changes `open` itself (or the
  // native dialog reports Esc through `cancel`); left null when the consumer flips the
  // prop, which reports as 'prop'.
  let pending: SearchPaletteReason | null = null
  const takeReason = (): SearchPaletteReason => {
    const reason = pending ?? 'prop'
    pending = null
    return reason
  }

  // Keep the active index valid as the list changes (typing, items swapped).
  $effect(() => {
    const valid = searchValidActive(palette)
    if (valid !== active) active = valid
  })

  // Mirror `open` onto the native dialog (same guard dance as Modal), then
  // land focus on the input — the dialog's default focus target is the panel.
  $effect(() => {
    const el = dialog
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      input?.focus()
      onopen?.({ reason: takeReason() })
    } else if (!open && el.open) {
      el.close()
    }
  })

  // Lock the page behind the palette while open (the dialog's own .results
  // already has overscroll-behavior: contain). Shares Modal's reference-counted
  // lock, so a palette opened over a modal (or vice versa) unwinds correctly.
  $effect(() => {
    if (!open) return
    lockScroll()
    return unlockScroll
  })

  // Polite live text for the always-rendered status node: silent until the
  // user types, then the result count (or the no-results text).
  const status = $derived(searchStatus(query, flat.length, resultsText, emptyText))

  function run(action: SearchPaletteAction | null) {
    if (!action) return
    switch (action.type) {
      case 'open':
        pending = action.reason
        open = true
        break
      case 'close':
        pending = action.reason
        open = false
        break
      case 'move':
        active = action.index
        void tick().then(() => optionAt(active)?.scrollIntoView({ block: 'nearest' }))
        break
      case 'activate':
        // href options: click the real anchor so the router/native semantics
        // apply — its click handler runs choose() for us.
        if (action.via === 'anchor') optionAt(action.index)?.click()
        else choose(action.index)
        break
    }
  }

  // Esc on the native dialog fires `cancel` right before `close`.
  function onDialogCancel() {
    pending = 'escape'
  }

  // Native `close` (Esc, .close()) → sync state, optionally reset, notify.
  function onDialogClose() {
    if (open) open = false
    if (resetOnClose) {
      query = ''
      active = 0
    }
    onclose?.({ reason: takeReason() })
  }

  // A press that starts on the <dialog> itself (not the inner panel) is a
  // backdrop hit (Modal's detection). Remembering where the press began avoids
  // closing on a drag that started inside the panel and was released on the
  // backdrop.
  //
  // The dialog closes on the `click`, not on the pointerdown: closing hands
  // focus back to the opener, and if that happened on pointerdown the same
  // gesture's mousedown would then land on the page and blur it, leaving focus
  // on <body>.
  let pressedBackdrop = false
  function onPointerDown(e: PointerEvent) {
    pressedBackdrop = e.target === dialog
  }
  function onClick(e: MouseEvent) {
    const hit = pressedBackdrop && e.target === dialog
    pressedBackdrop = false
    run(searchBackdropPress(palette, hit))
  }

  // DS-0139: the toggle chord goes through the shortcut registry (id
  // `ss:search-palette`) instead of a hand-rolled window listener — listed in
  // ShortcutsHelp, disable/remap-able (WCAG 2.1.4), deterministic on
  // collision. While the palette is open, its own modal <dialog> suppresses
  // global shortcuts (SC 2.1.2), so the binding re-registers focus-scoped on
  // the dialog; same id, so overrides follow both directions of the toggle.
  // `add()` is SSR-safe (no-op without `window`).
  $effect(() => {
    if (shortcut === false) return
    const options = {
      id: 'ss:search-palette',
      label: 'Open search',
      keys: shortcut,
      allowInInputs: true, // chorded — must fire while typing (incl. the palette's own input)
      onPress: () => run(searchShortcut(open)),
    }
    const el = dialog
    return open && el ? shortcuts.add({ ...options, scope: 'focus' }, el) : shortcuts.add(options)
  })

  function onInputKeydown(e: KeyboardEvent) {
    const result = searchInputKey(palette, e.key, e.isComposing)
    if (!result) return
    if (result.preventDefault) e.preventDefault()
    run(result.action)
  }

  function optionAt(index: number): HTMLElement | null {
    return list?.querySelector<HTMLElement>(`#${CSS.escape(optionId(index))}`) ?? null
  }

  // Shared select path for clicks and Enter; navigation (when any) has
  // already been dispatched on the anchor itself.
  function choose(index: number) {
    const result = searchItemPress(palette, index)
    if (!result) return
    const keep = onselect?.(flat[index]) === false
    if (!keep) run(result.close)
  }

  function hover(index: number) {
    const next = searchHover(palette, index)
    if (next !== null) active = next
  }

  // Focus must never leave the input (aria-activedescendant pattern):
  // swallow the focusing pointerdown on option rows before it lands.
  function onRowPointerDown(e: PointerEvent) {
    e.preventDefault()
  }

  // Reset the selection to the top whenever the query changes; after tick()
  // the derived `flat` reflects the new query regardless of handler order.
  async function onQueryInput() {
    await tick()
    active = searchFirstActive(palette)
  }
</script>

<dialog
  bind:this={dialog}
  class="ss-search-palette"
  data-size-variant={resolveComponentSize('SearchPalette', size)}
  aria-label={ariaLabel}
  oncancel={onDialogCancel}
  onclose={onDialogClose}
  onpointerdown={onPointerDown}
  onclick={onClick}
>
  <div class="panel">
    <div class="bar">
      <input
        bind:this={input}
        bind:value={query}
        oninput={onQueryInput}
        onkeydown={onInputKeydown}
        class="input"
        type="text"
        {placeholder}
        spellcheck="false"
        autocomplete="off"
        aria-label={ariaLabel}
        aria-controls={listId}
        {...searchInputAttrs(flat.length, optionId(active))}
      />
      <!-- Touch exit for the full-screen small-viewport layout (no backdrop to
         tap there); hidden on wider screens, where Esc/backdrop close it. -->
      <button
        type="button"
        class="close"
        aria-label={closeLabel}
        onclick={() => run(searchClosePress(palette))}>×</button
      >
    </div>

    <p class="sr-only" role="status">{status}</p>

    <div class="results" bind:this={list}>
      {#if flat.length === 0}
        {#if empty}
          {@render empty(query)}
        {:else}
          <p class="state">{emptyText}</p>
        {/if}
      {:else}
        <ul id={listId} class="listbox" role="listbox" aria-label={ariaLabel}>
          {#each groups as group (group.label)}
            <li
              class="group"
              role={group.label ? 'group' : 'presentation'}
              aria-label={group.label ?? undefined}
            >
              {#if group.label}
                <span class="group-label" aria-hidden="true">{group.label}</span>
              {/if}
              <ul role="presentation">
                {#each group.entries as { item: it, index } (it.id)}
                  <li role="presentation">
                    {#if it.href && !it.disabled}
                      <a
                        id={optionId(index)}
                        class="row"
                        class:active={index === active}
                        href={it.href}
                        {...searchOptionAttrs({ index, active })}
                        onpointerdown={onRowPointerDown}
                        onmousemove={() => hover(index)}
                        onclick={() => choose(index)}
                      >
                        {@render body(it, index)}
                      </a>
                    {:else}
                      <button
                        id={optionId(index)}
                        type="button"
                        class="row"
                        class:active={index === active}
                        class:disabled={it.disabled}
                        {...searchOptionAttrs({ index, active, disabled: it.disabled })}
                        onpointerdown={onRowPointerDown}
                        onmousemove={() => hover(index)}
                        onclick={() => choose(index)}
                      >
                        {@render body(it, index)}
                      </button>
                    {/if}
                  </li>
                {/each}
              </ul>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    {#if footer}
      <footer class="foot">{@render footer()}</footer>
    {:else if footerText !== false && footerText !== ''}
      <footer class="foot">{footerText}</footer>
    {/if}
  </div>
</dialog>

{#snippet body(it: T, index: number)}
  {#if itemSnippet}
    {@render itemSnippet(it, { active: index === active })}
  {:else}
    <span class="label">{it.label}</span>
    {#if it.hint}
      <span class="hint">{it.hint}</span>
    {/if}
  {/if}
{/snippet}

<style lang="scss">
  // Native <dialog> ships UA defaults — reset them so the token-driven
  // surface is the only chrome. The panel sits high (15vh) like a launcher,
  // not vertically centered like Modal.
  .ss-search-palette {
    padding: 0;
    border: 1px solid var(--ss-line-strong);
    background: var(--ss-bg-elev);
    color: var(--ss-fg);
    box-shadow: var(--ss-shadow-pop);
    font-family: var(--ss-font-mono);
    width: var(--ss-search-palette-w, 40rem);
    max-width: var(--ss-search-palette-max, calc(100vw - var(--ss-s-8)));
    margin: var(--ss-search-palette-top, 15vh) auto auto;
    overflow: hidden; // .results owns the scroll

    &::backdrop {
      background: var(--ss-search-palette-backdrop, rgba(0, 0, 0, 0.62));
    }

    // size axis → panel width only (type + paddings stay constant).
    &[data-size-variant='sm'] {
      --ss-search-palette-w: 32rem;
    }
    &[data-size-variant='lg'] {
      --ss-search-palette-w: 48rem;
    }
  }

  .panel {
    display: flex;
    flex-direction: column;
  }

  .bar {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--ss-line);

    &:focus-within {
      border-bottom-color: var(--ss-primary);
    }
  }

  .input {
    flex: 1;
    min-width: 0;
    width: 100%;
    padding: var(--ss-search-palette-input-pad, var(--ss-s-4)) var(--ss-s-4);
    background: transparent;
    border: none;
    color: var(--ss-fg);
    font-family: inherit;
    font-size: var(--ss-search-palette-input-size, var(--ss-ui-lg, var(--ss-size-body)));

    &:focus {
      outline: none;
    }
    &::placeholder {
      color: var(--ss-fg-muted);
    }
  }

  // Hidden on wide viewports; the small-viewport media query below shows it.
  .close {
    display: none;
    flex: none;
    align-items: center;
    justify-content: center;
    min-inline-size: var(--ss-s-10);
    min-block-size: var(--ss-s-10);
    margin-inline-end: var(--ss-s-2);
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    color: var(--ss-fg-muted);
    font-family: inherit;
    font-size: var(--ss-size-h3);
    line-height: 1;
    cursor: pointer;

    &:hover {
      color: var(--ss-fg);
      border-color: var(--ss-line-strong);
    }
  }

  // Visually hidden but announced (result-count live region).
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .results {
    overflow-y: auto;
    max-height: var(--ss-search-palette-list-h, 60vh);
    overscroll-behavior: contain;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .state {
    margin: 0;
    padding: var(--ss-s-4);
    font-size: var(--ss-ui-sm);
    color: var(--ss-fg-muted);
  }

  .group-label {
    display: block;
    padding: var(--ss-s-3) var(--ss-s-4) var(--ss-s-1);
    font-size: var(--ss-ui-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ss-fg-muted);
  }

  .row {
    display: block;
    width: 100%;
    padding: var(--ss-s-2) var(--ss-s-4);
    // The active rail eats 2px of the inline-start padding so text doesn't shift.
    border: none;
    border-inline-start: 2px solid transparent;
    padding-inline-start: calc(var(--ss-s-4) - 2px);
    background: transparent;
    color: var(--ss-fg);
    font-family: inherit;
    text-align: start;
    text-decoration: none;
    cursor: pointer;

    &.active {
      background: var(--ss-primary-soft);
      border-inline-start-color: var(--ss-primary);
    }
    &.disabled {
      color: var(--ss-fg-faint, var(--ss-fg-muted));
      cursor: default;
    }
  }

  .label {
    display: block;
    font-size: var(--ss-ui-md);
    line-height: var(--ss-leading, 1.5);
  }

  .hint {
    display: block;
    margin-top: 2px;
    font-size: var(--ss-ui-sm);
    color: var(--ss-fg-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .foot {
    padding: var(--ss-s-2) var(--ss-s-4);
    border-top: 1px solid var(--ss-line);
    font-size: var(--ss-ui-xs);
    color: var(--ss-fg-muted);
  }

  // Full-screen launcher on small viewports; dvh keeps the input visible
  // when the mobile keyboard opens.
  @media (max-width: 767px) {
    .ss-search-palette {
      margin: 0;
      width: 100vw;
      max-width: 100vw;
      height: 100dvh;
      max-height: 100dvh;
    }
    .panel {
      height: 100%;
    }
    .results {
      flex: 1;
      max-height: none;
    }
    .close {
      display: inline-flex;
    }
  }

  // theme.css draws an animated underline under every <a> (`a::before`). These anchors are
  // component chrome, not prose links — cancel it here so the reset also ships in vanilla.css
  // (DS-0150; the specificity of a scoped class beats the global element rule).
  .row::before {
    content: none;
  }
</style>
