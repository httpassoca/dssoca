/**
 * Checkbox (DS-0197) — `.ss-checkbox .input[type=checkbox]` is a native checkbox, so toggling,
 * Space, label presses and form submission need no script. This module adds what HTML cannot
 * express: the mixed state (`data-indeterminate="true"` on the input → the `indeterminate`
 * property, applied by `mount()`), the shared rule that a mixed checkbox toggles to checked, and
 * an `ss:change` event on the root with `{ checked }`. No `reason`: the browser reports a press
 * on the box, on the label and Space as the same `change` event. The decision comes from
 * `../core/checkbox.js`, shared with the Svelte component; state is read from the DOM.
 */
import { on, emit, all, setAttrs } from './delegate.js'
import { checkboxInputAttrs, checkboxToggle } from '../core/checkbox.js'

const INPUT = '.ss-checkbox .input[type="checkbox"]'

/** Write a state to a checkbox (property + `data-indeterminate`). Emits nothing. */
export function setCheckbox(
  input: HTMLInputElement,
  state: { checked?: boolean; indeterminate?: boolean },
): void {
  if (state.checked !== undefined) input.checked = state.checked
  if (state.indeterminate !== undefined) {
    input.indeterminate = state.indeterminate
    setAttrs(input, checkboxInputAttrs(state.indeterminate))
  }
}

/** Copy `data-indeterminate="true"` onto the `indeterminate` property under `root`. */
export function mountCheckboxes(root: ParentNode = document): void {
  for (const input of all<HTMLInputElement>(root, `${INPUT}[data-indeterminate="true"]`)) {
    input.indeterminate = true
  }
}

export function installCheckbox(): void {
  on('change', INPUT, (el) => {
    const input = el as HTMLInputElement
    // The browser has already flipped `checked` and cleared `indeterminate`; the state from
    // before the press is the inverse value plus the attribute the markup still carries.
    const next = checkboxToggle({
      checked: !input.checked,
      indeterminate: input.dataset.indeterminate === 'true',
      disabled: input.disabled,
    })
    if (!next) return
    setCheckbox(input, next)
    emit(input.closest('.ss-checkbox') ?? input, 'ss:change', { checked: next.checked })
  })
}
