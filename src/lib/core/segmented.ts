/**
 * SegmentedControl core (DS-0197) — the radiogroup's behaviour, decided once for
 * SegmentedControl.svelte and `vanilla/segmented.ts`: what a press or a key selects, which
 * segment owns the tab stop, and the state attributes. Pure functions: no DOM, no Svelte. The
 * reading direction is read by the caller and passed in as `rtl`.
 */
import { rovingStep, rovingTabindex, type RovingMove } from './behaviors/roving.js'

/** What moved the selection; passed to `onChange` / `ss:change`. */
export type SegmentedReason = 'press' | 'key'

export interface SegmentedChangeDetails {
  reason: SegmentedReason
}

export interface SegmentedState {
  /** Index of the selected segment, `-1` when none. */
  selected: number
  /** Indexes of the enabled segments, in DOM order (empty when the whole group is disabled). */
  enabled: readonly number[]
}

/** Select segment `index`. `changed` is false when it already was the selection (no event). */
export interface SegmentedAction {
  type: 'select'
  index: number
  changed: boolean
  /** Move DOM focus to the segment too (keyboard: focus and selection travel together). */
  focus: boolean
  reason: SegmentedReason
}

/** A key the group handles: its action, and whether the browser default must be cancelled. */
export interface SegmentedKeyResult {
  action: SegmentedAction
  preventDefault: boolean
}

const select = (
  state: SegmentedState,
  index: number,
  focus: boolean,
  reason: SegmentedReason,
): SegmentedAction | null =>
  state.enabled.includes(index)
    ? { type: 'select', index, changed: index !== state.selected, focus, reason }
    : null

/** A segment was pressed. `null` when it (or the group) is disabled. */
export function segmentedPress(state: SegmentedState, index: number): SegmentedAction | null {
  return select(state, index, false, 'press')
}

function moveFor(key: string, rtl: boolean): RovingMove | null {
  switch (key) {
    // Left/Right follow the visual order: under RTL the row runs right-to-left, so ArrowLeft
    // points at the NEXT segment. Up/Down stay logical.
    case 'ArrowRight':
      return rtl ? 'prev' : 'next'
    case 'ArrowLeft':
      return rtl ? 'next' : 'prev'
    case 'ArrowDown':
      return 'next'
    case 'ArrowUp':
      return 'prev'
    case 'Home':
      return 'first'
    case 'End':
      return 'last'
    default:
      return null
  }
}

/**
 * A key on segment `index`. Arrows / Home / End move over the enabled segments (wrapping) and
 * select the target. `null` = not a group key, or nothing is enabled: let it through.
 */
export function segmentedKey(
  state: SegmentedState,
  index: number,
  key: string,
  rtl = false,
): SegmentedKeyResult | null {
  const move = moveFor(key, rtl)
  if (!move) return null
  // A segment that is not enabled is no position to step from: fall back to an edge.
  const from = state.enabled.includes(index) ? index : -1
  const action = select(state, rovingStep(state.enabled, from, move), true, 'key')
  return action && { action, preventDefault: true }
}

/**
 * The index that owns the group's single tab stop: the selected segment when it is enabled,
 * otherwise the first enabled one; `-1` when nothing is enabled.
 */
export function segmentedTabStop(state: SegmentedState): number {
  return state.enabled.includes(state.selected) ? state.selected : (state.enabled[0] ?? -1)
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so the Svelte spread and the vanilla `setAttribute` write the same DOM.

export function segmentedGroupAttrs(disabled: boolean) {
  return { role: 'radiogroup', 'aria-disabled': disabled ? 'true' : undefined } as const
}

export function segmentedItemAttrs(index: number, selected: number, tabStop: number) {
  return {
    role: 'radio',
    'aria-checked': index === selected ? 'true' : 'false',
    tabindex: rovingTabindex(index, tabStop),
  } as const
}
