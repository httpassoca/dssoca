/**
 * Tabs core (DS-0197) — the WAI-ARIA tabs pattern, decided once for Tabs.svelte and
 * `vanilla/tabs.ts`: what a press or a key selects, where a key moves focus, which tab owns the
 * tab stop, and the state attributes. Pure functions: no DOM, no Svelte. The reading direction
 * is read by the caller and passed in as `rtl`.
 */
import { rovingStep, rovingTabindex, type RovingMove } from './behaviors/roving.js'

/** What moved the selection; passed to `onChange` / `ss:change`. */
export type TabsReason = 'press' | 'key'

/**
 * How the keyboard selects. `'auto'`: moving focus with the arrows selects the tab it lands on.
 * `'manual'`: the arrows only move focus, Enter / Space select the focused tab.
 */
export type TabsActivation = 'auto' | 'manual'

export interface TabsChangeDetails {
  reason: TabsReason
}

export interface TabsState {
  /** Index of the selected tab, `-1` when none. */
  selected: number
  /** Indexes of the enabled tabs, in DOM order. */
  enabled: readonly number[]
}

export type TabsAction =
  | {
      /** Select tab `index`. `changed` is false when it already was the selection (no event). */
      type: 'select'
      index: number
      changed: boolean
      /** Move DOM focus to the tab too (keyboard, automatic activation). */
      focus: boolean
      reason: TabsReason
    }
  /** Move DOM focus only (keyboard, manual activation). */
  | { type: 'focus'; index: number }

/** A key the tab list handles: its action, and whether the browser default must be cancelled. */
export interface TabsKeyResult {
  action: TabsAction
  preventDefault: boolean
}

export interface TabsKeyOptions {
  /** The tab list runs right-to-left: ArrowLeft points at the NEXT tab. */
  rtl?: boolean
  activation?: TabsActivation
}

const select = (
  state: TabsState,
  index: number,
  focus: boolean,
  reason: TabsReason,
): TabsAction | null =>
  state.enabled.includes(index)
    ? { type: 'select', index, changed: index !== state.selected, focus, reason }
    : null

/**
 * The tab to show: the one the consumer's value points at, or — when it points at nothing — the
 * first enabled tab, so a panel is always visible. `-1` when there is neither.
 */
export function tabsSelected(index: number, enabled: readonly number[]): number {
  return index >= 0 ? index : (enabled[0] ?? -1)
}

/** A tab was pressed. `null` when it is disabled. */
export function tabsPress(state: TabsState, index: number): TabsAction | null {
  return select(state, index, false, 'press')
}

function moveFor(key: string, rtl: boolean): RovingMove | null {
  switch (key) {
    // Left/Right follow the visual order: under RTL the list runs right-to-left, so ArrowLeft
    // points at the NEXT tab. Up/Down are left to the page (a horizontal tab list).
    case 'ArrowRight':
      return rtl ? 'prev' : 'next'
    case 'ArrowLeft':
      return rtl ? 'next' : 'prev'
    case 'Home':
      return 'first'
    case 'End':
      return 'last'
    default:
      return null
  }
}

/**
 * A key on tab `index`. Arrows / Home / End move over the enabled tabs (wrapping): with
 * automatic activation the target is selected as it takes focus, with manual activation it only
 * takes focus and Enter / Space select it. `null` = not a tab-list key, or nothing is enabled:
 * let it through.
 */
export function tabsKey(
  state: TabsState,
  index: number,
  key: string,
  { rtl = false, activation = 'auto' }: TabsKeyOptions = {},
): TabsKeyResult | null {
  if (key === 'Enter' || key === ' ') {
    // Automatic activation: the focused tab already is the selection, and the native button
    // click covers the rest. Manual: select here so the change is reported as a key.
    if (activation !== 'manual') return null
    const action = select(state, index, false, 'key')
    return action && { action, preventDefault: true }
  }
  const move = moveFor(key, rtl)
  if (!move) return null
  // A tab that is not enabled is no position to step from: fall back to an edge.
  const from = state.enabled.includes(index) ? index : -1
  const target = rovingStep(state.enabled, from, move)
  if (target < 0) return null
  const action: TabsAction | null =
    activation === 'manual' ? { type: 'focus', index: target } : select(state, target, true, 'key')
  return action && { action, preventDefault: true }
}

/**
 * The index that owns the list's single tab stop: the selected tab when it is enabled, otherwise
 * the first enabled one; `-1` when nothing is enabled.
 */
export function tabsTabStop(state: TabsState): number {
  return state.enabled.includes(state.selected) ? state.selected : (state.enabled[0] ?? -1)
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so the Svelte spread and the vanilla `setAttribute` write the same DOM.

export function tabsListAttrs() {
  return { role: 'tablist' } as const
}

export interface TabsTabAttrsInput {
  index: number
  selected: number
  tabStop: number
  /** Id of the panel this tab controls. */
  panelId?: string
}

export function tabsTabAttrs(tab: TabsTabAttrsInput) {
  return {
    role: 'tab',
    'aria-selected': tab.index === tab.selected ? 'true' : 'false',
    'aria-controls': tab.panelId,
    tabindex: rovingTabindex(tab.index, tab.tabStop),
  } as const
}

/**
 * The panel of a tab: named by its tab, and focusable so its content is reachable by Tab even
 * when it holds nothing focusable. Visibility (`hidden`) is written by the caller.
 */
export function tabsPanelAttrs(tabId?: string) {
  return { role: 'tabpanel', 'aria-labelledby': tabId, tabindex: 0 } as const
}
