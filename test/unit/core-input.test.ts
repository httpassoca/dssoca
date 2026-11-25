import { describe, it, expect } from 'vitest'
import { inputClear, inputShowClear, type InputClearState } from '$lib/core/input'

const state = (over: Partial<InputClearState> = {}): InputClearState => ({
  value: 'abc',
  disabled: false,
  readonly: false,
  ...over,
})

describe('core/input', () => {
  it('shows the clear button on an editable field with a value', () => {
    expect(inputShowClear(state())).toBe(true)
  })

  it('hides the clear button when there is nothing to clear', () => {
    expect(inputShowClear(state({ value: '' }))).toBe(false)
  })

  it('hides the clear button on a readonly or disabled field', () => {
    expect(inputShowClear(state({ readonly: true }))).toBe(false)
    expect(inputShowClear(state({ disabled: true }))).toBe(false)
  })

  it('keeps the clear button for whitespace-only values (they are still a value)', () => {
    expect(inputShowClear(state({ value: ' ' }))).toBe(true)
  })

  it('clearing empties the value and sends focus back to the input', () => {
    expect(inputClear(state())).toEqual({ value: '', focusInput: true })
    // An already-empty editable field still clears (and still refocuses): harmless.
    expect(inputClear(state({ value: '' }))).toEqual({ value: '', focusInput: true })
  })

  it('refuses to clear a field that cannot be edited', () => {
    expect(inputClear(state({ readonly: true }))).toBeNull()
    expect(inputClear(state({ disabled: true }))).toBeNull()
  })
})
