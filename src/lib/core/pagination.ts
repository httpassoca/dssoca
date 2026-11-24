/**
 * Pagination core (DS-0197) — the page-window maths, the bounds, and what a press on a page
 * button or a stepper does. Pure functions over a small state object; Pagination.svelte holds
 * the state and applies the result. No DOM, no Svelte.
 */

/** What changed the page; passed to `onchange`. */
export type PaginationReason = 'page' | 'prev' | 'next'

export interface PaginationChangeDetails {
  reason: PaginationReason
}

export interface PaginationCountInput {
  /** Explicit page count; wins over `total` / `pageSize`. */
  pageCount?: number
  /** Total item count. */
  total?: number
  /** Items per page. */
  pageSize: number
}

/** Number of pages. Derived counts are at least 1, so the control never renders empty. */
export function paginationPageCount(input: PaginationCountInput): number {
  return input.pageCount ?? Math.max(1, Math.ceil((input.total ?? 0) / input.pageSize))
}

/** `page` clamped into `[1, pages]`. */
export function paginationClamp(page: number, pages: number): number {
  return Math.min(Math.max(1, page), pages)
}

/** One rendered cell: a page number, or the ellipsis before / after the sibling window. */
export type PaginationSlot = number | 'gap-start' | 'gap-end'

/**
 * The windowed list of slots: first page, last page, `siblingCount` pages on each side of
 * `current`, and an ellipsis wherever a run of pages is hidden. A single hidden page is cheaper
 * to show than an ellipsis, so a run only collapses when it hides more than one page.
 */
export function paginationSlots(
  current: number,
  pages: number,
  siblingCount: number,
): PaginationSlot[] {
  const start = Math.max(2, current - siblingCount)
  const end = Math.min(pages - 1, current + siblingCount)
  const out: PaginationSlot[] = [1]
  if (start > 3) out.push('gap-start')
  else if (start === 3) out.push(2)
  for (let p = start; p <= end; p++) out.push(p)
  if (end < pages - 2) out.push('gap-end')
  else if (end === pages - 2) out.push(pages - 1)
  if (pages > 1) out.push(pages)
  return out
}

export function paginationIsGap(slot: PaginationSlot): slot is 'gap-start' | 'gap-end' {
  return slot === 'gap-start' || slot === 'gap-end'
}

export interface PaginationState {
  /** The clamped current page (see {@link paginationClamp}). */
  current: number
  pages: number
  disabled: boolean
}

export interface PaginationChange {
  /** The new page. */
  page: number
  reason: PaginationReason
  /**
   * Where focus must go once the page has changed. A stepper that lands on its bound becomes
   * natively disabled while it is focused, which would drop focus to `<body>`; it hands focus
   * to the new current-page button instead. `null` = leave focus where it is.
   */
  focus: 'current' | null
}

function change(
  state: PaginationState,
  target: number,
  reason: PaginationReason,
): PaginationChange | null {
  const page = paginationClamp(target, state.pages)
  if (state.disabled || page === state.current) return null
  const atBound = (reason === 'prev' && page <= 1) || (reason === 'next' && page >= state.pages)
  return { page, reason, focus: atBound ? 'current' : null }
}

/** A page-number button was pressed. `null` = nothing changes (disabled, or already there). */
export function paginationPagePress(
  state: PaginationState,
  target: number,
): PaginationChange | null {
  return change(state, target, 'page')
}

/** The Prev / Next stepper was pressed. `null` = nothing changes (disabled, or at the bound). */
export function paginationStep(
  state: PaginationState,
  direction: 'prev' | 'next',
): PaginationChange | null {
  return change(state, state.current + (direction === 'prev' ? -1 : 1), direction)
}

/** Whether the Prev / Next stepper is disabled: the whole control is, or it sits at its bound. */
export function paginationStepperDisabled(
  state: PaginationState,
  direction: 'prev' | 'next',
): boolean {
  return (
    state.disabled || (direction === 'prev' ? state.current <= 1 : state.current >= state.pages)
  )
}

/** State attributes of one page-number button. */
export function paginationPageAttrs(slot: number, current: number) {
  return {
    'aria-current': slot === current ? 'page' : undefined,
    'aria-label': `Page ${slot}`,
  } as const
}
