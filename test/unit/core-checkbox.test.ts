import { describe, it, expect } from 'vitest'
import { checkboxToggle, checkboxInputAttrs } from '$lib/core/checkbox'

describe('core/checkbox', () => {
  it('flips the checked state', () => {
    expect(checkboxToggle({ checked: false, indeterminate: false, disabled: false })).toEqual({
      checked: true,
      indeterminate: false,
    })
    expect(checkboxToggle({ checked: true, indeterminate: false, disabled: false })).toEqual({
      checked: false,
      indeterminate: false,
    })
  })

  it('goes from indeterminate to checked, whatever the underlying value was', () => {
    for (const checked of [false, true]) {
      expect(checkboxToggle({ checked, indeterminate: true, disabled: false })).toEqual({
        checked: true,
        indeterminate: false,
      })
    }
  })

  it('refuses to change while disabled', () => {
    expect(checkboxToggle({ checked: false, indeterminate: false, disabled: true })).toBeNull()
    expect(checkboxToggle({ checked: true, indeterminate: true, disabled: true })).toBeNull()
  })

  it('reflects the mixed state as a string data attribute, and never as aria-checked', () => {
    expect(checkboxInputAttrs(true)).toEqual({ 'data-indeterminate': 'true' })
    expect(checkboxInputAttrs(false)).toEqual({ 'data-indeterminate': undefined })
    expect(checkboxInputAttrs(true)).not.toHaveProperty('aria-checked')
  })
})
