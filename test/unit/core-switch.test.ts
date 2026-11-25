import { describe, it, expect } from 'vitest'
import { switchToggle, switchTrackAttrs } from '$lib/core/switch'

describe('core/switch', () => {
  it('flips the checked state', () => {
    expect(switchToggle({ checked: false, disabled: false })).toBe(true)
    expect(switchToggle({ checked: true, disabled: false })).toBe(false)
  })

  it('refuses to change while disabled', () => {
    expect(switchToggle({ checked: false, disabled: true })).toBeNull()
    expect(switchToggle({ checked: true, disabled: true })).toBeNull()
  })

  it('reflects the state as role=switch + a string aria-checked', () => {
    expect(switchTrackAttrs(true)).toEqual({ role: 'switch', 'aria-checked': 'true' })
    expect(switchTrackAttrs(false)).toEqual({ role: 'switch', 'aria-checked': 'false' })
  })
})
