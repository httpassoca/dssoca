/**
 * Menu core (DS-0198) — the one place the menu's behaviour is decided. Pure functions over a
 * small state object: an event comes in, a {@link MenuAction} comes out, and the caller applies
 * it (Menu.svelte to its `$state`, `vanilla/menu.ts` to the DOM). No DOM, no Svelte.
 */
import { rovingStep, rovingTabindex } from './behaviors/roving.js'

/** Why the menu opened or closed; passed to `onOpenChange` / `ss:openchange`. */
export type MenuReason = 'trigger' | 'key' | 'escape' | 'tab' | 'outside' | 'item'

export interface MenuOpenChangeDetails {
  reason: MenuReason
}

export interface MenuState {
  open: boolean
  /** Index of the focused item, `-1` when none. */
  active: number
  /** Indexes of the enabled items, in DOM order. */
  enabled: readonly number[]
}

export type MenuAction =
  | { type: 'open'; focus: number; reason: MenuReason }
  | { type: 'close'; returnFocus: boolean; reason: MenuReason }
  | { type: 'focus'; index: number }

/** A key the menu handles: its action, and whether the browser default must be cancelled. */
export interface MenuKeyResult {
  action: MenuAction | null
  preventDefault: boolean
}

const open = (state: MenuState, edge: 'first' | 'last', reason: MenuReason): MenuAction | null =>
  state.open ? null : { type: 'open', focus: rovingStep(state.enabled, -1, edge), reason }

const close = (state: MenuState, returnFocus: boolean, reason: MenuReason): MenuAction | null =>
  state.open ? { type: 'close', returnFocus, reason } : null

/** Open from code (`openMenu`), focusing the first or last enabled item. */
export function menuOpen(state: MenuState, edge: 'first' | 'last' = 'first'): MenuAction | null {
  return open(state, edge, 'trigger')
}

/** Close from code (`closeMenu`). */
export function menuClose(state: MenuState, returnFocus = true): MenuAction | null {
  return close(state, returnFocus, 'trigger')
}

/** The trigger was pressed: toggle. */
export function menuTriggerPress(state: MenuState): MenuAction | null {
  return state.open ? close(state, true, 'trigger') : open(state, 'first', 'trigger')
}

/** A key on the trigger. `null` = not a menu key, let it through. */
export function menuTriggerKey(state: MenuState, key: string): MenuKeyResult | null {
  switch (key) {
    case 'ArrowDown':
    case 'Enter':
    case ' ':
      return { action: open(state, 'first', 'key'), preventDefault: true }
    case 'ArrowUp':
      return { action: open(state, 'last', 'key'), preventDefault: true }
    default:
      return null
  }
}

/** A key inside the panel. `null` = not a menu key, let it through. */
export function menuPanelKey(state: MenuState, key: string): MenuKeyResult | null {
  const move = (to: 'next' | 'prev' | 'first' | 'last'): MenuKeyResult => ({
    action: { type: 'focus', index: rovingStep(state.enabled, state.active, to) },
    preventDefault: true,
  })
  switch (key) {
    case 'ArrowDown':
      return move('next')
    case 'ArrowUp':
      return move('prev')
    case 'Home':
      return move('first')
    case 'End':
      return move('last')
    case 'Escape':
      return { action: close(state, true, 'escape'), preventDefault: true }
    case 'Tab':
      // Tabbing out dismisses the menu; focus moves naturally (no trap, no default cancelled).
      return { action: close(state, false, 'tab'), preventDefault: false }
    default:
      return null
  }
}

/** A pointer went down outside the menu: dismiss without pulling focus back. */
export function menuOutsidePress(state: MenuState): MenuAction | null {
  return close(state, false, 'outside')
}

/** An activated item: it is selected, and `action` closes the menu (when it is open). */
export interface MenuItemResult {
  action: MenuAction | null
}

/** An item was activated. `null` when it is disabled: nothing is selected, the menu stays. */
export function menuItemPress(state: MenuState, index: number): MenuItemResult | null {
  if (!state.enabled.includes(index)) return null
  return { action: close(state, true, 'item') }
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so the Svelte spread and the vanilla `setAttribute` write the same DOM.

const bool = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false')

export function menuTriggerAttrs(isOpen: boolean) {
  return { 'aria-haspopup': 'menu', 'aria-expanded': bool(isOpen) } as const
}

export function menuPanelAttrs(isOpen: boolean) {
  return { role: 'menu', 'aria-hidden': bool(!isOpen), tabindex: -1 } as const
}

export interface MenuItemAttrsInput {
  index: number
  active: number
  /** The menu is a selection group (some item carries a `selected` flag). */
  selectable: boolean
  selected?: boolean
  disabled?: boolean
}

export function menuItemAttrs(item: MenuItemAttrsInput) {
  return {
    role: item.selectable ? 'menuitemradio' : 'menuitem',
    'aria-checked': item.selectable ? bool(Boolean(item.selected)) : undefined,
    'aria-disabled': item.disabled ? 'true' : undefined,
    tabindex: rovingTabindex(item.index, item.active),
  } as const
}
