import { describe, it, expect } from 'vitest'
import {
  numberFieldAnnouncement,
  numberFieldBounds,
  numberFieldClamp,
  numberFieldOption,
  numberFieldParse,
  numberFieldStep,
  numberFieldStepperAttrs,
  type NumberFieldState,
} from '$lib/core/number-field'

const state = (over: Partial<NumberFieldState> = {}): NumberFieldState => ({
  value: 5,
  locked: false,
  ...over,
})

describe('core/number-field — parsing', () => {
  it('reads the browser-parsed number', () => {
    expect(numberFieldParse('12', 12)).toBe(12)
    expect(numberFieldParse('-0.5', -0.5)).toBe(-0.5)
    expect(numberFieldParse('0', 0)).toBe(0)
  })

  it('an empty or unparseable input is null', () => {
    expect(numberFieldParse('', NaN)).toBeNull()
    expect(numberFieldParse('', 0)).toBeNull()
    expect(numberFieldParse('abc', NaN)).toBeNull()
  })

  it('reads numeric options from attribute text', () => {
    expect(numberFieldOption('3')).toBe(3)
    expect(numberFieldOption('0')).toBe(0)
    expect(numberFieldOption('-1.5')).toBe(-1.5)
    expect(numberFieldOption(null)).toBeNull()
    expect(numberFieldOption(undefined)).toBeNull()
    expect(numberFieldOption('')).toBeNull()
    expect(numberFieldOption('any')).toBeNull()
  })
})

describe('core/number-field — clamping and bounds', () => {
  it('clamps into [min, max]', () => {
    expect(numberFieldClamp(5, 0, 10)).toBe(5)
    expect(numberFieldClamp(-3, 0, 10)).toBe(0)
    expect(numberFieldClamp(30, 0, 10)).toBe(10)
  })

  it('a missing bound does not constrain', () => {
    expect(numberFieldClamp(-99)).toBe(-99)
    expect(numberFieldClamp(99, 0)).toBe(99)
    expect(numberFieldClamp(-99, null, 10)).toBe(-99)
    expect(numberFieldClamp(99, undefined, 10)).toBe(10)
  })

  it('treats 0 as a real bound', () => {
    expect(numberFieldClamp(-1, 0)).toBe(0)
    expect(numberFieldClamp(1, null, 0)).toBe(0)
  })

  it('reports the bounds the value sits on or beyond', () => {
    expect(numberFieldBounds({ value: 5, min: 0, max: 10 })).toEqual({ atMin: false, atMax: false })
    expect(numberFieldBounds({ value: 0, min: 0, max: 10 })).toEqual({ atMin: true, atMax: false })
    expect(numberFieldBounds({ value: 10, min: 0, max: 10 })).toEqual({ atMin: false, atMax: true })
    expect(numberFieldBounds({ value: -4, min: 0, max: 10 }).atMin).toBe(true)
    expect(numberFieldBounds({ value: 40, min: 0, max: 10 }).atMax).toBe(true)
  })

  it('an empty field or an unbounded one is at no bound', () => {
    expect(numberFieldBounds({ value: null, min: 0, max: 10 })).toEqual({
      atMin: false,
      atMax: false,
    })
    expect(numberFieldBounds({ value: 3 })).toEqual({ atMin: false, atMax: false })
  })
})

describe('core/number-field — stepping', () => {
  it('nudges by 1 by default', () => {
    expect(numberFieldStep(state(), 1)).toBe(6)
    expect(numberFieldStep(state(), -1)).toBe(4)
    expect(numberFieldStep(state({ step: null }), 1)).toBe(6)
  })

  it('nudges by the given step', () => {
    expect(numberFieldStep(state({ step: 5 }), 1)).toBe(10)
    expect(numberFieldStep(state({ step: 0.5 }), -1)).toBe(4.5)
  })

  it('clamps a step that would overshoot a bound', () => {
    expect(numberFieldStep(state({ value: 8, step: 5, max: 10 }), 1)).toBe(10)
    expect(numberFieldStep(state({ value: 2, step: 5, min: 0 }), -1)).toBe(0)
  })

  it('is a no-op at the bound in that direction only', () => {
    expect(numberFieldStep(state({ value: 10, min: 0, max: 10 }), 1)).toBeNull()
    expect(numberFieldStep(state({ value: 10, min: 0, max: 10 }), -1)).toBe(9)
    expect(numberFieldStep(state({ value: 0, min: 0, max: 10 }), -1)).toBeNull()
    expect(numberFieldStep(state({ value: 0, min: 0, max: 10 }), 1)).toBe(1)
  })

  it('pulls an out-of-range value back inside when stepping towards the range', () => {
    expect(numberFieldStep(state({ value: -20, min: 0, max: 10 }), 1)).toBe(0)
    expect(numberFieldStep(state({ value: 50, min: 0, max: 10 }), -1)).toBe(10)
  })

  it('is a no-op while the field is locked', () => {
    expect(numberFieldStep(state({ locked: true }), 1)).toBeNull()
    expect(numberFieldStep(state({ locked: true }), -1)).toBeNull()
  })

  it('an empty field starts from the near bound, else from 0', () => {
    expect(numberFieldStep(state({ value: null }), 1)).toBe(1)
    expect(numberFieldStep(state({ value: null }), -1)).toBe(-1)
    expect(numberFieldStep(state({ value: null, min: 10 }), 1)).toBe(11)
    expect(numberFieldStep(state({ value: null, max: 10 }), -1)).toBe(9)
    // The far bound is not a starting point, it only clamps.
    expect(numberFieldStep(state({ value: null, min: 10 }), -1)).toBe(10)
    expect(numberFieldStep(state({ value: null, max: -10 }), 1)).toBe(-10)
  })

  it('announces the new value as text', () => {
    expect(numberFieldAnnouncement(7)).toBe('7')
    expect(numberFieldAnnouncement(-0.5)).toBe('-0.5')
  })
})

describe('core/number-field — stepper attributes', () => {
  it('a free stepper carries neither disabled state', () => {
    expect(numberFieldStepperAttrs(state({ min: 0, max: 10 }), 1)).toEqual({
      disabled: false,
      'aria-disabled': undefined,
    })
  })

  it('at a bound the matching stepper is aria-disabled, never natively disabled', () => {
    const atMax = state({ value: 10, min: 0, max: 10 })
    expect(numberFieldStepperAttrs(atMax, 1)).toEqual({ disabled: false, 'aria-disabled': 'true' })
    expect(numberFieldStepperAttrs(atMax, -1)['aria-disabled']).toBeUndefined()
    const atMin = state({ value: 0, min: 0, max: 10 })
    expect(numberFieldStepperAttrs(atMin, -1)).toEqual({ disabled: false, 'aria-disabled': 'true' })
    expect(numberFieldStepperAttrs(atMin, 1)['aria-disabled']).toBeUndefined()
  })

  it('a locked field natively disables both steppers and drops aria-disabled', () => {
    const locked = state({ value: 10, min: 0, max: 10, locked: true })
    expect(numberFieldStepperAttrs(locked, 1)).toEqual({
      disabled: true,
      'aria-disabled': undefined,
    })
    expect(numberFieldStepperAttrs(locked, -1)).toEqual({
      disabled: true,
      'aria-disabled': undefined,
    })
  })
})
