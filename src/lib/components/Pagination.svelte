<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Pagination — DS-0100. A windowed page navigator: a Prev button, a list of
  // page-number buttons (first, last, and ±siblingCount around the current one,
  // with `…` ellipses bridging the gaps), and a Next button. Bindable 1-based
  // `page`, zero radius, mono numerals, `--ss-line` hairlines, size-token
  // density. The current page is `aria-current="page"`, visually active and
  // inert (re-clicking it never re-fires). WCAG 2.2 AA.
  // ─────────────────────────────────────────────────────────────────────────
  import { tick } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'
  import {
    paginationClamp,
    paginationIsGap,
    paginationPageAttrs,
    paginationPageCount,
    paginationPagePress,
    paginationSlots,
    paginationStep,
    paginationStepperDisabled,
    type PaginationChange,
    type PaginationChangeDetails,
    type PaginationState,
  } from '../core/pagination.js'

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
    /**
     * Fired when the page changes (after `page` updates), with the new page and what changed
     * it (`details.reason`: page · prev · next).
     */
    onchange?: (page: number, details: PaginationChangeDetails) => void
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

  // Behaviour lives in `core/pagination.ts`: the page window, the bounds and what a press
  // does are decided there; this file holds the state and applies the result.

  // Total number of pages — explicit `pageCount` wins, else derived from the
  // item count. Always at least 1 so the control never renders empty.
  const pages = $derived(paginationPageCount({ pageCount, total, pageSize }))

  // Clamp the active page into [1, pages] for all rendering/decisions.
  const current = $derived(paginationClamp(page, pages))

  // Windowed list of slots: first page, last page, the sibling window around
  // the current page, and an ellipsis marker wherever a run of pages is hidden.
  const slots = $derived(paginationSlots(current, pages, siblingCount))

  const pagination = $derived<PaginationState>({ current, pages, disabled })

  let navEl = $state<HTMLElement>()

  async function apply(change: PaginationChange | null) {
    if (!change) return
    page = change.page
    onchange?.(change.page, { reason: change.reason })
    if (change.focus === 'current') {
      // The stepper just became disabled under the focus: hand it to the current page.
      await tick()
      navEl?.querySelector<HTMLElement>('[aria-current="page"]')?.focus()
    }
  }

  const sizeAttr = $derived(resolveComponentSize('Pagination', size))
</script>

<nav
  bind:this={navEl}
  class="ss-pagination"
  aria-label="Pagination"
  data-size-variant={sizeAttr}
  data-disabled={disabled ? 'true' : undefined}
>
  <button
    type="button"
    class="page nav-btn"
    aria-label="Previous page"
    disabled={paginationStepperDisabled(pagination, 'prev')}
    onclick={() => apply(paginationStep(pagination, 'prev'))}
  >
    <!-- ‹ › are Bidi_Mirrored (UAX #9, rule L4): in an RTL context the browser
         already draws them flipped, so no transform is needed (one would
         double-mirror them back). -->
    <span aria-hidden="true">‹</span>
  </button>

  {#each slots as slot (slot)}
    {#if paginationIsGap(slot)}
      <span class="ellipsis" aria-hidden="true">…</span>
    {:else}
      {@const attrs = paginationPageAttrs(slot, current)}
      <button
        type="button"
        class="page"
        class:active={attrs['aria-current'] === 'page'}
        {...attrs}
        {disabled}
        onclick={() => apply(paginationPagePress(pagination, slot))}
      >
        {slot}
      </button>
    {/if}
  {/each}

  <button
    type="button"
    class="page nav-btn"
    aria-label="Next page"
    disabled={paginationStepperDisabled(pagination, 'next')}
    onclick={() => apply(paginationStep(pagination, 'next'))}
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
      // Hairline divider between cells via the leading (inline-start) border,
      // so it follows the reading direction in RTL.
      border-inline-start: 1px solid var(--ss-line);
      padding: var(--ss-pagination-py, 0.5em) var(--ss-pagination-px, 0.625em);
      cursor: pointer;
      white-space: nowrap;
      transition:
        color var(--ss-dur-fast) var(--ss-ease),
        background var(--ss-dur-fast) var(--ss-ease);

      &:first-child {
        border-inline-start: 0;
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
        // Inset ring so the highlight reads inside the shared frame. Solid
        // --ss-primary (not the 12-18% soft wash) keeps it at 3:1 (WCAG 1.4.11).
        box-shadow: inset 0 0 0 2px var(--ss-primary);
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
      border-inline-start: 1px solid var(--ss-line);
      color: var(--ss-fg-muted);
      font-family: var(--ss-font-mono);
      line-height: 1;
      user-select: none;
    }
  }
</style>
