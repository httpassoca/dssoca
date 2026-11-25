/**
 * RadioGroup core (DS-0197) — the decisions that belong to the group, shared by
 * RadioGroup.svelte and `vanilla/radio.ts`. Pure functions: no DOM, no Svelte.
 *
 * The options are native `<input type="radio">` elements sharing a `name`, so the browser owns
 * arrow-key movement (wrapping, skipping disabled, mirrored under RTL), Space and form
 * submission, and reports every one of them as a `change` event on the newly checked input.
 * What stays ours is decided here: which options are enabled, what a press on an option
 * selects, which option is the tab stop (most of all when nothing is selected), and the state
 * attributes. A press and an arrow key cannot be told apart reliably from a `change` event, so
 * there is no `reason`: the callback and the `ss:change` event carry the new value only.
 */
import { rovingTabindex } from './behaviors/roving.js'

export interface RadioState {
  /** Index of the selected option, `-1` when none. */
  selected: number
  /** Indexes of the enabled options, in DOM order (empty when the whole group is disabled). */
  enabled: readonly number[]
}

/** Select option `index`. `changed` is false when it already was the selection (no event). */
export interface RadioAction {
  type: 'select'
  index: number
  changed: boolean
}

/**
 * The enabled option indexes: `optionDisabled[i]` is each option's own flag, and a disabled
 * group enables nothing.
 */
export function radioEnabled(optionDisabled: readonly boolean[], groupDisabled: boolean): number[] {
  if (groupDisabled) return []
  return optionDisabled.map((off, index) => (off ? -1 : index)).filter((index) => index >= 0)
}

/** An option was picked (pressed, or reached with an arrow key). `null` when it is disabled. */
export function radioPress(state: RadioState, index: number): RadioAction | null {
  return state.enabled.includes(index)
    ? { type: 'select', index, changed: index !== state.selected }
    : null
}

/**
 * The index that owns the group's single tab stop: the selected option when it is enabled,
 * otherwise the first enabled one (so a group with no selection, or with a disabled selection,
 * is still reachable); `-1` when nothing is enabled.
 */
export function radioTabStop(state: RadioState): number {
  return state.enabled.includes(state.selected) ? state.selected : (state.enabled[0] ?? -1)
}

// --- attributes ---------------------------------------------------------------
// Strings, not booleans, so the Svelte spread and the vanilla `setAttribute` write the same DOM.

export function radioGroupAttrs(disabled: boolean) {
  return { role: 'radiogroup', 'aria-disabled': disabled ? 'true' : undefined } as const
}

/**
 * Attributes for one native radio. No `role` and no `aria-checked`: the input already exposes
 * both from its `checked` property.
 */
export function radioInputAttrs(index: number, tabStop: number) {
  return { tabindex: rovingTabindex(index, tabStop) } as const
}
