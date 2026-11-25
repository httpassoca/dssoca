/**
 * RadioGroup (DS-0197) — `.ss-radio-group .input[type=radio]` are native radios sharing a
 * `name`, so selection, arrow keys (wrapping, skipping disabled, mirrored under RTL), Space and
 * form submission need no script. This module keeps the group's single tab stop where
 * `../core/radio.js` says it belongs after the selection moves, and emits `ss:change` on the
 * root with `{ value, index }`. No `reason`: the browser reports a press and an arrow key as the
 * same `change` event. State is read from the DOM.
 */
import { on, emit, all, setAttrs } from './delegate.js'
import {
  radioEnabled,
  radioInputAttrs,
  radioPress,
  radioTabStop,
  type RadioAction,
  type RadioState,
} from '../core/radio.js'

const INPUT = '.ss-radio-group .input[type="radio"]'

function radios(root: HTMLElement): HTMLInputElement[] {
  return all<HTMLInputElement>(root, '.input[type="radio"]').filter(
    (r) => r.closest('.ss-radio-group') === root,
  )
}

/** The group's state, read from the DOM (the DOM is the store on the plain-HTML path). */
function read(root: HTMLElement, list: HTMLInputElement[]): RadioState {
  return {
    selected: list.findIndex((r) => r.checked),
    enabled: radioEnabled(
      list.map((r) => r.disabled),
      root.getAttribute('aria-disabled') === 'true',
    ),
  }
}

/** Apply a core action to the DOM. */
function run(root: HTMLElement, list: HTMLInputElement[], action: RadioAction | null): void {
  if (!action) return
  const radio = list[action.index]
  if (!radio) return
  radio.checked = true
  const tabStop = radioTabStop(read(root, list))
  list.forEach((r, index) => setAttrs(r, radioInputAttrs(index, tabStop)))
  if (action.changed) emit(root, 'ss:change', { value: radio.value, index: action.index })
}

/** Select a radio from script, exactly as a press would (emits `ss:change` when it changes). */
export function selectRadio(radio: HTMLInputElement): void {
  const root = radio.closest<HTMLElement>('.ss-radio-group')
  if (!root) return
  const list = radios(root)
  run(root, list, radioPress(read(root, list), list.indexOf(radio)))
}

export function installRadio(): void {
  on('change', INPUT, (el) => {
    const root = el.closest<HTMLElement>('.ss-radio-group')
    if (!root) return
    const list = radios(root)
    // The browser has already moved the selection, and a native `change` only fires when it
    // did move — so the selection the core compares against is "some other option".
    const before = { ...read(root, list), selected: -1 }
    run(root, list, radioPress(before, list.indexOf(el as HTMLInputElement)))
  })
}
