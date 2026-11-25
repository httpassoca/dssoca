/**
 * SearchPalette core (DS-0197) — the one place the palette's behaviour is decided: which
 * items match a query, how they group, where the active option moves, what a key does and
 * why the palette opens or closes. Pure functions over a small state object; SearchPalette.svelte
 * holds the state and applies the result. No DOM, no Svelte.
 */
import { rovingStep, type RovingMove } from './behaviors/roving.js'

/** Why the palette opened or closed; passed to `onopen` / `onclose`. */
export type SearchPaletteReason =
  /** The toggle shortcut (`mod+k`). */
  | 'shortcut'
  /** Escape (the native dialog's `cancel`). */
  | 'escape'
  /** A press on the backdrop. */
  | 'backdrop'
  /** The × close button. */
  | 'close-button'
  /** An item was chosen. */
  | 'select'
  /** The consumer changed `open` (or called the dialog's `close()`) itself. */
  | 'prop'

export interface SearchPaletteOpenDetails {
  reason: SearchPaletteReason
}

/** The fields of an item the core reads. */
export interface SearchItemLike {
  label: string
  group?: string
  keywords?: string[]
  disabled?: boolean
  href?: string
}

// --- results ------------------------------------------------------------------

/** Case- and diacritic-insensitive fold ("São" matches "sao"). */
export function searchFold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Items whose label or keywords contain the query; a blank query keeps them all. */
export function searchFilter<T extends SearchItemLike>(items: readonly T[], query: string): T[] {
  const q = searchFold(query.trim())
  if (!q) return [...items]
  return items.filter((it) => searchFold([it.label, ...(it.keywords ?? [])].join(' ')).includes(q))
}

export interface SearchGroup<T> {
  /** Group heading; `null` for the ungrouped bucket. */
  label: string | null
  /** The bucket's items with their flat index (keyboard order equals DOM order). */
  entries: { item: T; index: number }[]
}

/** Buckets in first-appearance order, the ungrouped one (label `null`) always first. */
export function searchGroups<T extends SearchItemLike>(items: readonly T[]): SearchGroup<T>[] {
  const buckets: { label: string | null; bucket: T[] }[] = []
  for (const it of items) {
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
    entries: bucket.map((item) => ({ item, index: index++ })),
  }))
}

/** The grouped items in display order — what the flat `index` of an entry points into. */
export function searchFlat<T>(groups: readonly SearchGroup<T>[]): T[] {
  return groups.flatMap((g) => g.entries.map((e) => e.item))
}

/** Live-region text: silent until the user types, then the count (or the no-results text). */
export function searchStatus(
  query: string,
  count: number,
  resultsText: (count: number) => string,
  emptyText: string,
): string {
  if (!query.trim()) return ''
  return count ? resultsText(count) : emptyText
}

// --- state --------------------------------------------------------------------

export interface SearchPaletteState {
  open: boolean
  /** Flat index of the active option. */
  active: number
  /** The options in display order (see {@link searchFlat}). */
  items: readonly Pick<SearchItemLike, 'disabled' | 'href'>[]
}

const enabled = (state: SearchPaletteState): number[] =>
  state.items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0)

/** The option a fresh list starts on: the first selectable one (0 when there is none). */
export function searchFirstActive(state: SearchPaletteState): number {
  return Math.max(0, rovingStep(enabled(state), -1, 'first'))
}

/** `active` when it still points at a selectable option, else the first selectable one. */
export function searchValidActive(state: SearchPaletteState): number {
  const { active, items } = state
  return active >= items.length || items[active]?.disabled ? searchFirstActive(state) : active
}

/** The pointer moved over an option: it becomes active unless disabled (`null`). */
export function searchHover(state: SearchPaletteState, index: number): number | null {
  return state.items[index] && !state.items[index].disabled ? index : null
}

// --- actions ------------------------------------------------------------------

export type SearchPaletteAction =
  | { type: 'open'; reason: SearchPaletteReason }
  | { type: 'close'; reason: SearchPaletteReason }
  /** Make `index` the active option and scroll it into view. */
  | { type: 'move'; index: number }
  /**
   * Activate option `index`. `via: 'anchor'` = it is a link: click the rendered `<a>` so the
   * router's/native navigation applies (its click handler then runs the item press).
   */
  | { type: 'activate'; index: number; via: 'anchor' | 'item' }

/** A key the palette handles: its action, and whether the browser default must be cancelled. */
export interface SearchPaletteKeyResult {
  action: SearchPaletteAction | null
  preventDefault: boolean
}

const close = (
  state: SearchPaletteState,
  reason: SearchPaletteReason,
): SearchPaletteAction | null => (state.open ? { type: 'close', reason } : null)

/** The toggle shortcut fired. */
export function searchShortcut(isOpen: boolean): SearchPaletteAction {
  return { type: isOpen ? 'close' : 'open', reason: 'shortcut' }
}

/** A pointer went down on the dialog; `onBackdrop` = it hit the dialog itself, not the panel. */
export function searchBackdropPress(
  state: SearchPaletteState,
  onBackdrop: boolean,
): SearchPaletteAction | null {
  return onBackdrop ? close(state, 'backdrop') : null
}

/** The × close button was pressed. */
export function searchClosePress(state: SearchPaletteState): SearchPaletteAction | null {
  return close(state, 'close-button')
}

/** An activated option: it is selected, and `close` dismisses the palette unless the
 *  consumer's `onselect` returned `false`. */
export interface SearchItemResult {
  close: SearchPaletteAction | null
}

/** An option was activated (click or Enter). `null` when it is disabled or missing. */
export function searchItemPress(state: SearchPaletteState, index: number): SearchItemResult | null {
  const it = state.items[index]
  if (!it || it.disabled) return null
  return { close: close(state, 'select') }
}

/**
 * A key on the input. `null` = not a palette key, let it through (typing, caret keys — Home/End
 * stay native per the APG combobox; PageUp/PageDown jump to the first/last option instead).
 * `composing` = an IME composition is in progress: every key belongs to it.
 */
export function searchInputKey(
  state: SearchPaletteState,
  key: string,
  composing = false,
): SearchPaletteKeyResult | null {
  if (composing) return null
  const move = (to: RovingMove): SearchPaletteKeyResult => {
    const index = rovingStep(enabled(state), state.active, to)
    // Nothing selectable: stay put (still revealing the active row), or do nothing when empty.
    const target = index >= 0 ? index : state.items.length ? state.active : -1
    return {
      action: target >= 0 ? { type: 'move', index: target } : null,
      preventDefault: true,
    }
  }
  switch (key) {
    case 'ArrowDown':
      return move('next')
    case 'ArrowUp':
      return move('prev')
    case 'PageUp':
      return move('first')
    case 'PageDown':
      return move('last')
    case 'Enter': {
      const it = state.items[state.active]
      return {
        action:
          it && !it.disabled
            ? { type: 'activate', index: state.active, via: it.href ? 'anchor' : 'item' }
            : null,
        preventDefault: true,
      }
    }
    case 'Tab':
      // Focus stays on the input while the palette is open.
      return { action: null, preventDefault: true }
    default:
      return null
  }
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so a spread writes the same DOM everywhere.

const bool = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false')

/** Combobox state on the input; `activeId` is the DOM id of the active option. */
export function searchInputAttrs(count: number, activeId: string) {
  return {
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': bool(count > 0),
    'aria-activedescendant': count > 0 ? activeId : undefined,
  } as const
}

export function searchOptionAttrs(option: { index: number; active: number; disabled?: boolean }) {
  return {
    role: 'option',
    'aria-selected': bool(option.index === option.active),
    'aria-disabled': option.disabled ? 'true' : undefined,
    tabindex: -1,
  } as const
}
