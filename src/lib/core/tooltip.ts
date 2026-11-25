/**
 * Tooltip core (DS-0197) — which event shows or hides the tip, shared by Tooltip.svelte and
 * `vanilla/tooltip.ts`. It encodes WCAG 1.4.13 (Content on Hover or Focus):
 *
 * - dismissable: Escape hides an open tip wherever focus is;
 * - hoverable: the tip is part of the tooltip root, so a pointer or focus move that stays
 *   `within` the root never hides it;
 * - persistent: nothing here hides on a timer; the tip stays until the pointer leaves, focus
 *   leaves or Escape is pressed.
 *
 * Positioning and the DOM writes stay in the adapters. No DOM, no Svelte.
 */

export interface TooltipState {
  open: boolean
}

export type TooltipAction = { type: 'show' } | { type: 'hide' }

/** Where the pointer or focus came from / is going to. */
export interface TooltipMove {
  /** The other end of the move is inside the tooltip root (trigger or tip). */
  within: boolean
}

const OUTSIDE: TooltipMove = { within: false }

const hide = (state: TooltipState): TooltipAction | null => (state.open ? { type: 'hide' } : null)

/**
 * The pointer entered the root. Shows even when already open, so the adapter re-resolves which
 * element the tip describes.
 */
export function tooltipPointerEnter(
  _state: TooltipState,
  from: TooltipMove = OUTSIDE,
): TooltipAction | null {
  return from.within ? null : { type: 'show' }
}

/** The pointer left the root. Moving between the trigger and the tip is not leaving. */
export function tooltipPointerLeave(
  state: TooltipState,
  to: TooltipMove = OUTSIDE,
): TooltipAction | null {
  return to.within ? null : hide(state)
}

/** Focus landed inside the root: show, describing the element that took focus. */
export function tooltipFocusIn(_state: TooltipState): TooltipAction | null {
  return { type: 'show' }
}

/** Focus left an element of the root. Moving to another element inside it is not leaving. */
export function tooltipFocusOut(
  state: TooltipState,
  to: TooltipMove = OUTSIDE,
): TooltipAction | null {
  return to.within ? null : hide(state)
}

/**
 * A key pressed anywhere in the document. Escape hides an open tip; the event is left alone
 * (never cancelled), so an enclosing dialog or menu still sees it. `null` = not a tooltip key.
 */
export function tooltipKey(state: TooltipState, key: string): TooltipAction | null {
  return key === 'Escape' ? hide(state) : null
}

/**
 * The `aria-describedby` value of the described element: the tip id is added as one token while
 * open and removed while closed, keeping any description the element already has. `undefined` =
 * remove the attribute.
 */
export function tooltipDescribedBy(
  current: string | null | undefined,
  tipId: string,
  open: boolean,
): string | undefined {
  const ids = (current ?? '').split(/\s+/).filter((id) => id && id !== tipId)
  if (open) ids.push(tipId)
  return ids.length ? ids.join(' ') : undefined
}
