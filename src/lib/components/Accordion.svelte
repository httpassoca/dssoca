<script module lang="ts">
  /** One collapsible section of the Accordion. */
  export interface AccordionItem {
    /** Stable identifier — used for open state, `value`, and ARIA wiring. */
    id: string
    /** Header text (also the accessible name of the toggle button). */
    label: string
    /** Optional secondary text shown faint after the label. */
    hint?: string
    /** Disable this section — the header is not togglable. */
    disabled?: boolean
  }

  /** Controlled `value`: a single open id (single mode) or a list (`multiple`). */
  export type AccordionValue = string | string[] | undefined
</script>

<script lang="ts">
  import { untrack, type Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** The collapsible sections, top to bottom. */
    items: AccordionItem[]
    /**
     * Content renderer for each section's panel; receives the item.
     *   {#snippet panel(item)} … {/snippet}
     */
    panel: Snippet<[AccordionItem]>
    /** Optional header renderer; overrides the default label + hint markup. */
    header?: Snippet<[AccordionItem]>
    /** Allow several sections open at once. Default: single-open. */
    multiple?: boolean
    /**
     * Controlled open state (bindable). In single mode a `string` id (or
     * `undefined`); in `multiple` mode a `string[]` of open ids. When omitted,
     * the component manages its own (uncontrolled) state.
     */
    value?: AccordionValue
    /** Open these sections initially when uncontrolled. */
    defaultValue?: AccordionValue
    /** Fired with the new open value whenever a section toggles. */
    onChange?: (value: AccordionValue) => void
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Heading level wrapping each header button (for the document outline). */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
    /**
     * Base id used to namespace the generated header/panel ids. Defaults to a
     * stable per-instance id from `$props.id()` so server- and client-rendered
     * IDs match (SSR-safe, DS-0067).
     */
    idBase?: string
  }

  // Stable instance id — consistent between server and client renders, unlike
  // the previous Math.random() default (DS-0067).
  const uid = $props.id()

  let {
    items,
    panel,
    header,
    multiple = false,
    value = $bindable(),
    defaultValue,
    onChange,
    size,
    headingLevel = 3,
    idBase = `ss-acc-${uid}`,
  }: Props = $props()

  // --- open-state model ----------------------------------------------------
  // Normalise whatever `value`/`defaultValue` shape we were handed into a Set.
  function toSet(v: AccordionValue): Set<string> {
    if (v == null) return new Set()
    return new Set(Array.isArray(v) ? v : [v])
  }

  // Uncontrolled fallback store, seeded once from defaultValue. `untrack`
  // marks the read as an intentional one-time snapshot (not a live binding),
  // silencing the "referenced locally" reactivity warning.
  let internal = $state<Set<string>>(untrack(() => toSet(defaultValue)))

  // Controlled when the consumer passes `value` (incl. bound); else internal.
  const controlled = $derived(value !== undefined)
  const open = $derived(controlled ? toSet(value) : internal)

  const isOpen = (item: AccordionItem): boolean => open.has(item.id)

  /** Project a Set back to the public value shape for `value`/`onChange`. */
  function project(next: Set<string>): AccordionValue {
    if (multiple) return [...next]
    return next.size ? [...next][0] : undefined
  }

  function toggle(item: AccordionItem) {
    if (item.disabled) return
    const next = new Set(open)
    if (next.has(item.id)) {
      next.delete(item.id)
    } else {
      if (!multiple) next.clear() // single-open: opening one closes others
      next.add(item.id)
    }
    if (controlled) {
      value = project(next) // keep the bound value in sync
    } else {
      internal = next
    }
    onChange?.(project(next))
  }

  // --- roving keyboard nav across headers (WAI-ARIA Accordion pattern) -----
  let headerEls = $state<Array<HTMLButtonElement | null>>([])

  function focusHeader(index: number) {
    const n = items.length
    if (n === 0) return
    const i = ((index % n) + n) % n // wrap
    headerEls[i]?.focus()
  }

  function onHeaderKeydown(e: KeyboardEvent, index: number) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusHeader(index + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusHeader(index - 1)
        break
      case 'Home':
        e.preventDefault()
        focusHeader(0)
        break
      case 'End':
        e.preventDefault()
        focusHeader(items.length - 1)
        break
      // Enter / Space activate the native <button>; no extra handling needed.
    }
  }

  const headerId = (item: AccordionItem) => `${idBase}-h-${item.id}`
  const panelId = (item: AccordionItem) => `${idBase}-p-${item.id}`
</script>

<div class="ss-accordion" data-size-variant={resolveComponentSize('Accordion', size)}>
  {#each items as item, i (item.id)}
    {@const expanded = isOpen(item)}
    <div class="item" class:open={expanded} class:disabled={item.disabled}>
      <div role="heading" aria-level={headingLevel} class="heading">
        <button
          bind:this={headerEls[i]}
          type="button"
          class="head"
          id={headerId(item)}
          aria-expanded={expanded}
          aria-controls={panelId(item)}
          aria-disabled={item.disabled || undefined}
          onclick={() => toggle(item)}
          onkeydown={(e) => onHeaderKeydown(e, i)}
        >
          {#if header}
            {@render header(item)}
          {:else}
            <span class="title">{item.label}</span>
            {#if item.hint}<span class="hint">{item.hint}</span>{/if}
          {/if}
          <span class="chevron" aria-hidden="true"></span>
        </button>
      </div>
      <div
        class="panel"
        id={panelId(item)}
        role="region"
        aria-labelledby={headerId(item)}
        hidden={!expanded}
      >
        <div class="panel-inner">
          {@render panel(item)}
        </div>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  // Accordion size tokens — authored here (scoped) so they ship without
  // touching the shared token sheet; they cascade like any --ss-* custom
  // property. Defaults mirror the `md` size; sm/lg rescale via the size axis.
  .ss-accordion {
    --ss-acc-head-py: var(--ss-row-py);
    --ss-acc-head-px: var(--ss-row-px);
    --ss-acc-body-py: var(--ss-s-3);
    --ss-acc-body-px: var(--ss-row-px);
    --ss-acc-chevron: 9px;
    --ss-acc-gap: var(--ss-s-3);

    &[data-size-variant='sm'] {
      --ss-acc-head-py: var(--ss-s-1);
      --ss-acc-head-px: var(--ss-s-2);
      --ss-acc-body-py: var(--ss-s-2);
      --ss-acc-body-px: var(--ss-s-2);
      --ss-acc-chevron: 7px;
      --ss-acc-gap: var(--ss-s-2);
    }
    &[data-size-variant='lg'] {
      --ss-acc-head-py: var(--ss-s-3);
      --ss-acc-head-px: var(--ss-s-4);
      --ss-acc-body-py: var(--ss-s-4);
      --ss-acc-body-px: var(--ss-s-4);
      --ss-acc-chevron: 11px;
      --ss-acc-gap: var(--ss-s-4);
    }

    display: flex;
    flex-direction: column;
    border: 1px solid var(--ss-line);
    background: var(--ss-bg);

    .item {
      & + .item {
        border-top: 1px solid var(--ss-line);
      }
    }

    .heading {
      margin: 0;
      // role=heading on a div — neutralise any inherited heading styling.
      font: inherit;
    }

    .head {
      display: flex;
      align-items: center;
      gap: var(--ss-acc-gap);
      width: 100%;
      box-sizing: border-box;
      padding: var(--ss-acc-head-py) var(--ss-acc-head-px);
      background: none;
      border: 0;
      text-align: left;
      cursor: pointer;
      color: var(--ss-fg);
      font: 500 var(--ss-ui-md) var(--ss-font-mono);
      transition:
        background var(--ss-dur-fast) var(--ss-ease),
        color var(--ss-dur-fast) var(--ss-ease);

      &:hover:not([aria-disabled='true']) {
        background: var(--ss-hover);
      }
      &:focus-visible {
        outline: 2px solid var(--ss-primary);
        outline-offset: -2px;
      }
      &[aria-disabled='true'] {
        cursor: not-allowed;
        color: var(--ss-fg-faint);
      }

      .title {
        flex: 1 1 auto;
        min-width: 0;
      }
      .hint {
        flex: 0 0 auto;
        color: var(--ss-fg-faint);
        font-size: var(--ss-ui-sm);
      }

      // Chevron — a rotating caret built from borders; turns 180° on open.
      .chevron {
        flex: 0 0 auto;
        width: var(--ss-acc-chevron);
        height: var(--ss-acc-chevron);
        border-right: 1.5px solid currentColor;
        border-bottom: 1.5px solid currentColor;
        transform: rotate(45deg); // points down (collapsed)
        transform-origin: center;
        transition: transform var(--ss-dur) var(--ss-ease);
        color: var(--ss-fg-muted);
      }
    }

    .item.open .head .chevron {
      // 45° (down) + 180° → points up when expanded.
      transform: rotate(225deg);
    }

    // Animated reveal — grid-rows trick gives a height transition without a
    // hardcoded max-height. Collapses instantly under prefers-reduced-motion
    // because --ss-dur is 0ms there (see _tokens.scss).
    .panel {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows var(--ss-dur) var(--ss-ease);

      &[hidden] {
        display: grid; // keep the grid so the collapse can animate
        grid-template-rows: 0fr;
      }
      &:not([hidden]) {
        grid-template-rows: 1fr;
      }
    }

    .panel-inner {
      overflow: hidden;
      min-height: 0;
    }

    .panel:not([hidden]) .panel-inner {
      padding: var(--ss-acc-body-py) var(--ss-acc-body-px);
      color: var(--ss-fg-muted);
      font-size: var(--ss-ui-md);
      line-height: var(--ss-leading);
    }
  }
</style>
