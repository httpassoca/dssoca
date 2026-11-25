/**
 * Checkbox core (DS-0197) — the toggle decision and the state attribute, shared by
 * Checkbox.svelte and `vanilla/checkbox.ts`. No DOM, no Svelte.
 *
 * The control is a native `<input type="checkbox">`, so the browser owns activation (Space, a
 * press on the box, a press on the wrapping `<label>`) and reports all of them as one `change`
 * event. Those sources cannot be told apart, so there is no `reason`: the callback and the
 * `ss:change` event carry the new value only.
 */

export interface CheckboxState {
  checked: boolean
  /** The "mixed" third state (a parent of partly-selected children). */
  indeterminate: boolean
  disabled: boolean
}

/** The state after a toggle. A user toggle always resolves the mixed state. */
export interface CheckboxNext {
  checked: boolean
  indeterminate: false
}

/**
 * The next state for a toggle, or `null` when the checkbox is disabled and must not change.
 * Toggling a mixed checkbox always lands on checked, whatever `checked` was underneath (the
 * browser would flip the hidden value instead, which can land on unchecked).
 */
export function checkboxToggle(state: CheckboxState): CheckboxNext | null {
  if (state.disabled) return null
  return { checked: state.indeterminate ? true : !state.checked, indeterminate: false }
}

/**
 * State attribute for the input. `indeterminate` is a DOM property with no HTML attribute, so
 * the markup carries it as `data-indeterminate` (plain HTML declares the mixed state with it and
 * `vanilla.js` copies it onto the property). No `aria-checked`: a native checkbox already exposes
 * checked / unchecked / mixed from `checked` + `indeterminate`, and ARIA in HTML forbids
 * `aria-checked` on it.
 */
export function checkboxInputAttrs(indeterminate: boolean) {
  return { 'data-indeterminate': indeterminate ? 'true' : undefined } as const
}
