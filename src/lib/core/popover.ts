/**
 * Popover core (DS-0197) — the one place the popover's behaviour is decided: a non-modal panel
 * anchored to a trigger. Pure functions over a small state object: an event comes in, a
 * {@link PopoverAction} comes out, and the caller applies it (Popover.svelte to its `$state`,
 * `vanilla/popover.ts` to the DOM). No DOM, no Svelte. Sibling of `menu.ts`.
 */

/** Why the popover opened or closed; passed to `onOpenChange` / `ss:openchange`. */
export type PopoverReason = 'trigger' | 'escape' | 'outside' | 'tab'

export interface PopoverOpenChangeDetails {
  reason: PopoverReason
}

export interface PopoverState {
  open: boolean
}

export type PopoverAction =
  /** Show the panel and move focus into it (first focusable element, else the panel). */
  | { type: 'open'; reason: PopoverReason }
  | { type: 'close'; returnFocus: boolean; reason: PopoverReason }

/** A key the popover handles: its action, and whether the browser default must be cancelled. */
export interface PopoverKeyResult {
  action: PopoverAction | null
  preventDefault: boolean
}

/**
 * Where focus went when it left an element of the popover: to another element `inside` it
 * (trigger or panel), to an element `outside` it, or `nowhere` (the window lost focus, or a
 * pointer landed on something that takes none).
 */
export type PopoverFocusTarget = 'inside' | 'outside' | 'nowhere'

const open = (state: PopoverState, reason: PopoverReason): PopoverAction | null =>
  state.open ? null : { type: 'open', reason }

const close = (
  state: PopoverState,
  returnFocus: boolean,
  reason: PopoverReason,
): PopoverAction | null => (state.open ? { type: 'close', returnFocus, reason } : null)

/** Open from code (`openPopover`). */
export function popoverOpen(state: PopoverState): PopoverAction | null {
  return open(state, 'trigger')
}

/** Close from code (`closePopover`). */
export function popoverClose(state: PopoverState, returnFocus = true): PopoverAction | null {
  return close(state, returnFocus, 'trigger')
}

/** The trigger was pressed: toggle. */
export function popoverTriggerPress(state: PopoverState): PopoverAction | null {
  return state.open ? close(state, true, 'trigger') : open(state, 'trigger')
}

/**
 * A key anywhere in the popover (trigger or panel). Escape closes an open popover and hands
 * focus back to the trigger. `null` = not a popover key (or nothing to close): let it through,
 * so an enclosing surface still sees it.
 */
export function popoverKey(state: PopoverState, key: string): PopoverKeyResult | null {
  if (key !== 'Escape' || !state.open) return null
  return { action: close(state, true, 'escape'), preventDefault: true }
}

/** A pointer went down outside the popover: dismiss without pulling focus back. */
export function popoverOutsidePress(state: PopoverState): PopoverAction | null {
  return close(state, false, 'outside')
}

/**
 * Focus left an element of the popover. Tabbing out (focus lands on an element outside) closes
 * it and lets focus go on; moving between the trigger and the panel, or losing focus to nothing,
 * does not — the popover is persistent.
 */
export function popoverFocusOut(state: PopoverState, to: PopoverFocusTarget): PopoverAction | null {
  return to === 'outside' ? close(state, false, 'tab') : null
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so the Svelte spread and the vanilla `setAttribute` write the same DOM.

export function popoverTriggerAttrs(isOpen: boolean) {
  return { 'aria-haspopup': 'dialog', 'aria-expanded': isOpen ? 'true' : 'false' } as const
}

/**
 * The panel: a non-modal dialog (no `aria-modal`), focusable from code so focus has somewhere
 * to land when the content holds nothing focusable. Closed-state hiding (`inert`) is written by
 * the caller.
 */
export function popoverPanelAttrs() {
  return { role: 'dialog', tabindex: -1 } as const
}
