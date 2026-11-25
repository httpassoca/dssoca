/**
 * Accordion core (DS-0197) — which sections are open after a header press, and where the arrow
 * keys move focus, decided once for Accordion.svelte and `vanilla/accordion.ts`. Pure functions:
 * no DOM, no Svelte. The caller owns the store (a `$state` Set / the `aria-expanded` attributes).
 */
import { rovingStep, type RovingMove } from './behaviors/roving.js'

/** The public open value: one id (single mode), a list (`multiple`), or nothing open. */
export type AccordionOpenValue = string | string[] | undefined

export interface AccordionState {
  /** Ids of the open sections. */
  open: readonly string[]
  /** Several sections may be open at once; otherwise opening one closes the others. */
  multiple: boolean
}

/** Normalise a public value (`value` / `defaultValue`) into a list of open ids. */
export function accordionOpenIds(value: AccordionOpenValue): string[] {
  if (value == null) return []
  return Array.isArray(value) ? [...new Set(value)] : [value]
}

/** Project the open ids back to the public value shape (`value`, `onChange`, `ss:change`). */
export function accordionValue(open: readonly string[], multiple: boolean): AccordionOpenValue {
  return multiple ? [...open] : open[0]
}

/**
 * A header was pressed: the next open ids, or `null` when the section is disabled and nothing
 * changes. Closing keeps the others; opening appends (or replaces everything in single mode).
 */
export function accordionToggle(
  state: AccordionState,
  id: string,
  disabled = false,
): string[] | null {
  if (disabled) return null
  if (state.open.includes(id)) return state.open.filter((o) => o !== id)
  return state.multiple ? [...state.open, id] : [id]
}

/** A key the accordion handles: the header to focus; the browser default is always cancelled. */
export interface AccordionKeyResult {
  focus: number
  preventDefault: true
}

const MOVES: Record<string, RovingMove> = {
  ArrowDown: 'next',
  ArrowUp: 'prev',
  Home: 'first',
  End: 'last',
}

/**
 * A key on header `index` of `count`. Focus roves over every header, wrapping, disabled ones
 * included (they stay focusable so the section is discoverable). `null` = not an accordion key
 * (Enter / Space activate the native button), let it through.
 */
export function accordionHeaderKey(
  count: number,
  index: number,
  key: string,
): AccordionKeyResult | null {
  const move = Object.hasOwn(MOVES, key) ? MOVES[key] : undefined
  if (!move || count <= 0) return null
  const all = Array.from({ length: count }, (_, i) => i)
  return { focus: rovingStep(all, index, move), preventDefault: true }
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so the Svelte spread and the vanilla `setAttribute` write the same DOM.

export function accordionHeaderAttrs(expanded: boolean, disabled = false) {
  return {
    'aria-expanded': expanded ? 'true' : 'false',
    'aria-disabled': disabled ? 'true' : undefined,
  } as const
}
