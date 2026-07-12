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
    /** Footer hint row; false hides it. A `footer` snippet replaces it. @default '↑↓ navigate · ↵ open · esc close' */
    footerText?: string | false
    /** Clear the query and selection when the palette closes. @default true */
    resetOnClose?: boolean
    /** Token size (sm|md|lg); controls the panel width. Inherits the global size when unset. */
    size?: Size
    /** Called with the chosen item on Enter/click. Return false to keep the palette open. */
    onselect?: (item: T) => void | boolean
    /** Called after the palette opens. */
    onopen?: () => void
    /** Called after the palette closes (Esc, backdrop, selection). */
    onclose?: () => void
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

  // Case- and diacritic-insensitive fold ("São" matches "sao").
  const fold = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const filtered = $derived.by(() => {
    if (!filter) return items
    const q = fold(query.trim())
    if (!q) return items
    return items.filter((it) => fold([it.label, ...(it.keywords ?? [])].join(' ')).includes(q))
  })

  // Buckets in first-appearance order, ungrouped (label null) always first;
  // options carry a flat index so keyboard order equals DOM order.
  const groups = $derived.by(() => {
    const buckets: { label: string | null; bucket: T[] }[] = []
    for (const it of filtered) {
      const label = it.group ?? null
      let b = buckets.find((entry) => entry.label === label)
      if (!b) {
        b = { label, bucket: [] }
        buckets.push(b)
      }
      b.bucket.push(it)
    }
    buckets.sort((a, b) => Number(b.label === null) - Number(a.label === null))
    let index = 0
    return buckets.map(({ label, bucket }) => ({
      label,
      entries: bucket.map((entry) => ({ item: entry, index: index++ })),
    }))
  })
  const flat = $derived(groups.flatMap((g) => g.entries.map((e) => e.item)))

  function firstSelectable(): number {
    const i = flat.findIndex((it) => !it.disabled)
    return i === -1 ? 0 : i
  }

  // Keep the active index valid as the list changes (typing, items swapped).
  $effect(() => {
    if (active >= flat.length || flat[active]?.disabled) active = firstSelectable()
  })

  // Mirror `open` onto the native dialog (same guard dance as Modal), then
  // land focus on the input — the dialog's default focus target is the panel.
  $effect(() => {
    const el = dialog
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      input?.focus()
      onopen?.()
    } else if (!open && el.open) {
      el.close()
    }
  })

  // Native `close` (Esc, .close()) → sync state, optionally reset, notify.
  function onDialogClose() {
    if (open) open = false
    if (resetOnClose) {
      query = ''
      active = 0
    }
    onclose?.()
  }

  // A pointerdown landing on the <dialog> itself (not the inner panel) is a
  // backdrop hit (Modal's detection).
  function onPointerDown(e: PointerEvent) {
    if (e.target === dialog) open = false
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
      onPress: () => {
        open = !open
      },
    }
    const el = dialog
    return open && el ? shortcuts.add({ ...options, scope: 'focus' }, el) : shortcuts.add(options)
  })

  // Step to the next non-disabled option, wrapping; delta 0 re-validates.
  function move(delta: number, from = active) {
    const len = flat.length
    if (!len) return
    let i = from
    for (let step = 0; step < len; step++) {
      i = (i + delta + len) % len
      if (!flat[i].disabled) {
        active = i
        break
      }
    }
    void tick().then(() =>
      list?.querySelector(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({ block: 'nearest' }),
    )
  }

  function onInputKeydown(e: KeyboardEvent) {
    if (e.isComposing) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'PageUp') {
      // Home/End stay native (caret editing in the textbox, per APG combobox);
      // PageUp/PageDown jump to the first/last option instead.
      e.preventDefault()
      move(1, -1)
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      move(-1, flat.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = flat[active]
      if (!it || it.disabled) return
      // href options: click the real anchor so the router/native semantics
      // apply — its click handler runs choose() for us.
      if (it.href) anchorAt(active)?.click()
      else choose(it)
    } else if (e.key === 'Tab') {
      // Focus stays on the input while the palette is open.
      e.preventDefault()
    }
  }

  function anchorAt(index: number): HTMLAnchorElement | null {
    return list?.querySelector(`#${CSS.escape(optionId(index))}`) as HTMLAnchorElement | null
  }

  // Shared select path for clicks and Enter; navigation (when any) has
  // already been dispatched on the anchor itself.
  function choose(it: T) {
    if (it.disabled) return
    const keep = onselect?.(it) === false
    if (!keep) open = false
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
    active = firstSelectable()
  }
</script>

<dialog
  bind:this={dialog}
  class="ss-search-palette"
  data-size-variant={resolveComponentSize('SearchPalette', size)}
  aria-label={ariaLabel}
  onclose={onDialogClose}
  onpointerdown={onPointerDown}
>
  <div class="panel">
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
      role="combobox"
      aria-label={ariaLabel}
      aria-autocomplete="list"
      aria-expanded={flat.length > 0}
      aria-controls={listId}
      aria-activedescendant={flat.length ? optionId(active) : undefined}
    />

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
                        role="option"
                        aria-selected={index === active}
                        class="row"
                        class:active={index === active}
                        href={it.href}
                        tabindex="-1"
                        onpointerdown={onRowPointerDown}
                        onmousemove={() => (active = index)}
                        onclick={() => choose(it)}
                      >
                        {@render body(it, index)}
                      </a>
                    {:else}
                      <button
                        id={optionId(index)}
                        type="button"
                        role="option"
                        aria-selected={index === active}
                        aria-disabled={it.disabled || undefined}
                        class="row"
                        class:active={index === active}
                        class:disabled={it.disabled}
                        tabindex="-1"
                        onpointerdown={onRowPointerDown}
                        onmousemove={() => {
                          if (!it.disabled) active = index
                        }}
                        onclick={() => choose(it)}
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

  .input {
    width: 100%;
    padding: var(--ss-search-palette-input-pad, var(--ss-s-4)) var(--ss-s-4);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--ss-line);
    color: var(--ss-fg);
    font-family: inherit;
    font-size: var(--ss-search-palette-input-size, var(--ss-ui-lg, var(--ss-size-body)));

    &:focus {
      outline: none;
      border-bottom-color: var(--ss-primary);
    }
    &::placeholder {
      color: var(--ss-fg-muted);
    }
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
    // The active rail eats 2px of the left padding so text doesn't shift.
    border: none;
    border-left: 2px solid transparent;
    padding-left: calc(var(--ss-s-4) - 2px);
    background: transparent;
    color: var(--ss-fg);
    font-family: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;

    &.active {
      background: var(--ss-primary-soft);
      border-left-color: var(--ss-primary);
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
  }
</style>
