/**
 * Field behaviours (DS-0148) over the shared field skeleton:
 *
 * - Input `clearable`: `.ss-field .clear` empties `.ss-input`, refocuses it and hides itself;
 *   typing shows it again (Input.svelte removes the button entirely — vanilla toggles `hidden`).
 * - NumberField steppers: `.ss-numberfield .step.dec/.inc` nudge by `step`, clamped to
 *   `min`/`max` (decided in `core/number-field.ts`, like the component). At a bound a stepper becomes an
 *   `aria-disabled` no-op (still focusable, so focus never drops to <body>); it is natively
 *   `disabled` only when the input is disabled/readonly. Each nudge writes the new value to
 *   the field's polite `.live` region.
 * - Textarea autosize: `.ss-textarea .field.autosize` grows with content. Browsers with
 *   `field-sizing: content` do it in CSS; the JS `scrollHeight` sync is the fallback.
 */
import { on, all, setAttrs } from './delegate.js'
import { inputClear, inputShowClear, type InputClearState } from '../core/input.js'
import {
  numberFieldAnnouncement,
  numberFieldOption,
  numberFieldParse,
  numberFieldStep,
  numberFieldStepperAttrs,
  type NumberFieldState,
} from '../core/number-field.js'

const fire = (el: Element, type: string) => el.dispatchEvent(new Event(type, { bubbles: true }))

// ── Input clearable ─────────────────────────────────────────────────────────

// The decisions come from `../core/input.js`, shared with Input.svelte; state is read from the DOM.
const clearState = (input: HTMLInputElement): InputClearState => ({
  value: input.value,
  readonly: input.readOnly,
  disabled: input.disabled,
})

function syncClear(input: HTMLInputElement): void {
  const btn = input.closest('.control')?.querySelector<HTMLElement>('.clear')
  if (btn) btn.hidden = !inputShowClear(clearState(input))
}

export function clearInput(btn: HTMLElement): void {
  const input = btn.closest('.control')?.querySelector<HTMLInputElement>('.ss-input')
  if (!input) return
  const result = inputClear(clearState(input))
  if (!result) return
  input.value = result.value
  fire(input, 'input')
  syncClear(input)
  if (result.focusInput) input.focus()
}

// ── NumberField steppers ───────────────────────────────────────────────────

// Parsing, clamping, stepping and the stepper state come from `../core/number-field.js`,
// shared with NumberField.svelte; this side only reads the input and writes the result back.
const numberState = (input: HTMLInputElement): NumberFieldState => ({
  value: numberFieldParse(input.value, input.valueAsNumber),
  min: numberFieldOption(input.getAttribute('min')),
  max: numberFieldOption(input.getAttribute('max')),
  step: numberFieldOption(input.getAttribute('step')),
  locked: input.disabled || input.readOnly,
})

function syncSteppers(input: HTMLInputElement): void {
  const control = input.closest('.control')
  if (!control) return
  const state = numberState(input)
  const apply = (btn: HTMLButtonElement | null, dir: 1 | -1) => {
    if (!btn) return
    const { disabled, ...aria } = numberFieldStepperAttrs(state, dir)
    btn.disabled = disabled
    setAttrs(btn, aria)
  }
  apply(control.querySelector<HTMLButtonElement>('.step.dec'), -1)
  apply(control.querySelector<HTMLButtonElement>('.step.inc'), 1)
}

export function nudgeNumber(btn: HTMLButtonElement): void {
  const input = btn.closest('.control')?.querySelector<HTMLInputElement>('.ss-input')
  if (!input || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return
  const next = numberFieldStep(numberState(input), btn.classList.contains('inc') ? 1 : -1)
  if (next === null) return
  input.value = String(next)
  fire(input, 'input')
  fire(input, 'change')
  syncSteppers(input)
  const live = input.closest('.ss-numberfield')?.querySelector('.live')
  if (live) live.textContent = numberFieldAnnouncement(next)
}

// ── Textarea autosize ──────────────────────────────────────────────────────

export const supportsFieldSizing =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('field-sizing', 'content')

export function autosize(el: HTMLTextAreaElement): void {
  if (supportsFieldSizing) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function mountFields(root: ParentNode): void {
  for (const ta of all<HTMLTextAreaElement>(root, '.ss-textarea .field.autosize')) autosize(ta)
  for (const input of all<HTMLInputElement>(root, '.ss-field .ss-input')) syncClear(input)
  for (const input of all<HTMLInputElement>(root, '.ss-numberfield .ss-input')) syncSteppers(input)
}

export function installFields(): void {
  on('click', '.ss-field .clear', (btn) => clearInput(btn))
  on('input', '.ss-field .ss-input', (input) => syncClear(input as HTMLInputElement))
  on('click', '.ss-numberfield .step', (btn) => nudgeNumber(btn as HTMLButtonElement))
  on('input', '.ss-numberfield .ss-input', (input) => syncSteppers(input as HTMLInputElement))
  on('input', '.ss-textarea .field.autosize', (ta) => autosize(ta as HTMLTextAreaElement))
}
