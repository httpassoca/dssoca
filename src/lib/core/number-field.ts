/**
 * NumberField core (DS-0197) — parsing, clamping, stepping and the stepper state, shared by
 * NumberField.svelte and `vanilla/fields.ts`. No DOM, no Svelte.
 */

/** A bound or a value that may be absent (`null`/`undefined` = none). */
type Maybe = number | null | undefined

export interface NumberFieldState {
  /** Current value; `null` when the input is empty or not a number. */
  value: number | null
  min?: Maybe
  max?: Maybe
  /** Stepper increment; defaults to 1. */
  step?: Maybe
  /** The field is disabled or readonly: nothing may change it. */
  locked: boolean
}

/**
 * The value behind what the input holds. `raw` is its text and `asNumber` what the browser
 * parsed it to (`valueAsNumber`, or `Number(raw)`); empty or unparseable text is `null`.
 */
export function numberFieldParse(raw: string, asNumber: number): number | null {
  return raw === '' || Number.isNaN(asNumber) ? null : asNumber
}

/** A numeric option read from markup (`min`/`max`/`step` attribute): `null` when absent. */
export function numberFieldOption(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isNaN(n) ? null : n
}

/** `n` held inside `[min, max]`; a missing bound does not constrain. */
export function numberFieldClamp(n: number, min?: Maybe, max?: Maybe): number {
  if (min != null && n < min) return min
  if (max != null && n > max) return max
  return n
}

/** Is the value sitting on (or beyond) a bound? An empty field is at neither. */
export function numberFieldBounds(state: Pick<NumberFieldState, 'value' | 'min' | 'max'>) {
  const { value, min, max } = state
  return {
    atMin: value != null && min != null && value <= min,
    atMax: value != null && max != null && value >= max,
  }
}

/**
 * A stepper was pressed (`dir` 1 = increase, -1 = decrease): the next value, or `null` when the
 * press is a no-op (field locked, or already at that bound). An empty field starts from the
 * near bound (`min` going up, `max` going down), else from 0.
 */
export function numberFieldStep(state: NumberFieldState, dir: 1 | -1): number | null {
  if (state.locked) return null
  const { atMin, atMax } = numberFieldBounds(state)
  if (dir < 0 ? atMin : atMax) return null
  const base = state.value ?? (dir > 0 ? (state.min ?? 0) : (state.max ?? 0))
  return numberFieldClamp(base + dir * (state.step ?? 1), state.min, state.max)
}

/** What the polite live region says after a stepper changed the value. */
export function numberFieldAnnouncement(value: number): string {
  return String(value)
}

/**
 * State of one stepper button. Natively `disabled` only when the whole field is locked; at a
 * bound it stays focusable and becomes an `aria-disabled` no-op, so focus never drops to <body>.
 */
export function numberFieldStepperAttrs(state: NumberFieldState, dir: 1 | -1) {
  const { atMin, atMax } = numberFieldBounds(state)
  const atBound = dir < 0 ? atMin : atMax
  return {
    disabled: state.locked,
    'aria-disabled': !state.locked && atBound ? 'true' : undefined,
  } as const
}
