/**
 * Input core (DS-0197) — the clear-button decision, shared by Input.svelte and
 * `vanilla/fields.ts`. No DOM, no Svelte.
 */

export interface InputClearState {
  value: string
  disabled: boolean
  readonly: boolean
}

/**
 * Is the clear button useful? Only on a field that has a value and can be edited. (Whether the
 * field is `clearable` at all is the caller's: a prop in Svelte, the button's presence in HTML.)
 */
export function inputShowClear(state: InputClearState): boolean {
  return state.value !== '' && !state.readonly && !state.disabled
}

/** What pressing clear does: the next value, and focus goes back to the input. */
export interface InputClearResult {
  value: ''
  focusInput: true
}

/** The clear button was pressed. `null` when the field cannot be edited: nothing changes. */
export function inputClear(state: InputClearState): InputClearResult | null {
  if (state.readonly || state.disabled) return null
  return { value: '', focusInput: true }
}
