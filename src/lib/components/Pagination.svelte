<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Pagination — DS-0100. A windowed page navigator: a Prev button, a list of
  // page-number buttons (first, last, and ±siblingCount around the current one,
  // with `…` ellipses bridging the gaps), and a Next button. Bindable 1-based
  // `page`, zero radius, mono numerals, `--ss-line` hairlines, size-token
  // density. The current page is `aria-current="page"`, visually active and
  // inert (re-clicking it never re-fires). WCAG 2.2 AA.
  // ─────────────────────────────────────────────────────────────────────────
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Current page, 1-based (bindable). */
    page?: number
    /** Total item count — used with `pageSize` to derive the page count. */
    total?: number
    /** Explicit page count; overrides the `total`/`pageSize` computation. */
    pageCount?: number
    /** Items per page when deriving the count from `total`. Default 10. */
    pageSize?: number
    /** Page-number buttons to show on each side of the current page. Default 1. */
    siblingCount?: number
    /** Disable the whole control: every button is inert. */
    disabled?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Fired when the page changes (after `page` updates). */
    onchange?: (page: number) => void
  }

  let {
    page = $bindable(1),
    total,
    pageCount,
    pageSize = 10,
    siblingCount = 1,
    disabled = false,
    size,
    onchange,
  }: Props = $props()

  // Total number of pages — explicit `pageCount` wins, else derived from the
  // item count. Always at least 1 so the control never renders empty.
  const pages = $derived(pageCount ?? Math.max(1, Math.ceil((total ?? 0) / pageSize)))

  // Clamp the active page into [1, pages] for all rendering/decisions.
  const current = $derived(Math.min(Math.max(1, page), pages))

  type Slot = number | 'gap-start' | 'gap-end'

  // Windowed list of slots: first page, last page, the sibling window around
  // the current page, and an ellipsis marker wherever a run of pages is hidden.
  const slots = $derived.by<Slot[]>(() => {
    const start = Math.max(2, current - siblingCount)
    const end = Math.min(pages - 1, current + siblingCount)
    const out: Slot[] = [1]
    // A single hidden page is cheaper to show than an ellipsis — only collapse
    // a run into `…` when it hides more than one page.
    if (start > 3) out.push('gap-start')
    else if (start === 3) out.push(2)
    for (let p = start; p <= end; p++) out.push(p)
    if (end < pages - 2) out.push('gap-end')
    else if (end === pages - 2) out.push(pages - 1)
    if (pages > 1) out.push(pages)
    return out
  })

  const atFirst = $derived(current <= 1)
  const atLast = $derived(current >= pages)

  function go(target: number) {
    const next = Math.min(Math.max(1, target), pages)
    if (disabled || next === current) return
    page = next
    onchange?.(next)
  }

  const sizeAttr = $derived(resolveComponentSize('Pagination', size))
</script>

<nav
  class="ss-pagination"
  aria-label="Pagination"
  data-size-variant={sizeAttr}
  data-disabled={disabled ? 'true' : undefined}
>
  <button
    type="button"
    class="page nav-btn"
    aria-label="Previous page"
    disabled={disabled || atFirst}
    onclick={() => go(current - 1)}
  >
    <span aria-hidden="true">‹</span>
  </button>

  {#each slots as slot (slot)}
    {#if slot === 'gap-start' || slot === 'gap-end'}
      <span class="ellipsis" aria-hidden="true">…</span>
    {:else}
      {@const isCurrent = slot === current}
      <button
        type="button"
        class="page"
        class:active={isCurrent}
        aria-current={isCurrent ? 'page' : undefined}
        aria-label={`Page ${slot}`}
        {disabled}
        onclick={() => go(slot)}
      >
        {slot}
      </button>
    {/if}
  {/each}

  <button
    type="button"
    class="page nav-btn"
    aria-label="Next page"
    disabled={disabled || atLast}
    onclick={() => go(current + 1)}
  >
    <span aria-hidden="true">›</span>
  </button>
</nav>

<style lang="scss">
  .ss-pagination {
    display: inline-flex;
    align-items: center;
    // Collapse the shared 1px borders so adjacent buttons read as one control.
    gap: 0;
    border: 1px solid var(--ss-line);
    background: var(--ss-bg);
    width: max-content;
    max-width: 100%;

    .page {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--ss-pagination-min, 2.25em);
      font: 500 var(--ss-pagination-font, 0.875rem) / 1 var(--ss-font-mono);
      color: var(--ss-fg-muted);
      background: transparent;
      border: 0;
      // Hairline divider between cells via the leading border.
      border-left: 1px solid var(--ss-line);
      padding: var(--ss-pagination-py, 0.5em) var(--ss-pagination-px, 0.625em);
      cursor: pointer;
      white-space: nowrap;
      transition:
        color var(--ss-dur-fast) var(--ss-ease),
        background var(--ss-dur-fast) var(--ss-ease);

      &:first-child {
        border-left: 0;
      }

      &:hover:not(.active):not(:disabled) {
        color: var(--ss-fg);
        background: var(--ss-hover);
      }

      &.active {
        color: var(--ss-fg-on-primary);
        background: var(--ss-primary);
        cursor: default;
      }

      &:focus-visible {
        outline: none;
        // Inset ring so the highlight reads inside the shared frame.
        box-shadow: inset 0 0 0 2px var(--ss-primary-soft);
        z-index: 1;
      }

      &.active:focus-visible {
        box-shadow: inset 0 0 0 2px var(--ss-bg);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }

      // The active page is inert: clicks/hover never repaint, but it stays
      // focusable so keyboard users can read its aria-current.
      &.active:disabled {
        opacity: 1;
        cursor: default;
      }
    }

    .nav-btn {
      font-size: var(--ss-pagination-nav-font, 1rem);
    }

    .ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--ss-pagination-min, 2.25em);
      padding: var(--ss-pagination-py, 0.5em) var(--ss-pagination-px, 0.625em);
      border-left: 1px solid var(--ss-line);
      color: var(--ss-fg-muted);
      font-family: var(--ss-font-mono);
      line-height: 1;
      user-select: none;
    }
  }
</style>
