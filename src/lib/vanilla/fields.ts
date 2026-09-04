/**
 * Field behaviours (DS-0148) over the shared field skeleton:
 *
 * - Input `clearable`: `.ss-field .clear` empties `.ss-input`, refocuses it and hides itself;
 *   typing shows it again (Input.svelte removes the button entirely — vanilla toggles `hidden`).
 * - NumberField steppers: `.ss-numberfield .step.dec/.inc` nudge by `step`, clamped to
 *   `min`/`max`, and disable themselves at the bounds (same `nudge`/`clamp` as the component).
 * - Textarea autosize: `.ss-textarea .field.autosize` grows with content. Browsers with
 *   `field-sizing: content` do it in CSS; the JS `scrollHeight` sync is the fallback.
 */
import { on, all } from './delegate.js'

const fire = (el: Element, type: string) => el.dispatchEvent(new Event(type, { bubbles: true }))

// ── Input clearable ─────────────────────────────────────────────────────────

function syncClear(input: HTMLInputElement): void {
  const btn = input.closest('.control')?.querySelector<HTMLElement>('.clear')
  if (btn) btn.hidden = !input.value || input.readOnly || input.disabled
}

export function clearInput(btn: HTMLElement): void {
  const input = btn.closest('.control')?.querySelector<HTMLInputElement>('.ss-input')
  if (!input) return
  input.value = ''
  fire(input, 'input')
  syncClear(input)
  input.focus()
}

// ── NumberField steppers ───────────────────────────────────────────────────

const num = (s: string | null) => (s == null || s === '' ? null : Number(s))

function syncSteppers(input: HTMLInputElement): void {
  const control = input.closest('.control')
  if (!control) return
  const v = input.value === '' ? null : input.valueAsNumber
  const min = num(input.getAttribute('min'))
  const max = num(input.getAttribute('max'))
  const locked = input.disabled || input.readOnly
  const dec = control.querySelector<HTMLButtonElement>('.step.dec')
  const inc = control.querySelector<HTMLButtonElement>('.step.inc')
  if (dec) dec.disabled = locked || (v != null && min != null && v <= min)
  if (inc) inc.disabled = locked || (v != null && max != null && v >= max)
}

export function nudgeNumber(btn: HTMLButtonElement): void {
  const input = btn.closest('.control')?.querySelector<HTMLInputElement>('.ss-input')
  if (!input || btn.disabled) return
  const dir = btn.classList.contains('inc') ? 1 : -1
  const min = num(input.getAttribute('min'))
  const max = num(input.getAttribute('max'))
  const step = num(input.getAttribute('step')) ?? 1
  const current =
    input.value === '' || Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber
  const base = current ?? (dir > 0 ? (min ?? 0) : (max ?? 0))
  let next = base + dir * step
  if (min != null && next < min) next = min
  if (max != null && next > max) next = max
  input.value = String(next)
  fire(input, 'input')
  fire(input, 'change')
  syncSteppers(input)
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
