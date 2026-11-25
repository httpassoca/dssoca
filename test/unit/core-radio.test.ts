import { describe, it, expect } from 'vitest'
import {
  radioEnabled,
  radioGroupAttrs,
  radioInputAttrs,
  radioPress,
  radioTabStop,
} from '$lib/core/radio'

describe('core/radio', () => {
  it('lists the enabled options, skipping disabled ones', () => {
    expect(radioEnabled([false, true, false], false)).toEqual([0, 2])
    expect(radioEnabled([false, false], false)).toEqual([0, 1])
  })

  it('a disabled group enables nothing', () => {
    expect(radioEnabled([false, false, false], true)).toEqual([])
  })

  it('a press selects the option and says whether the selection moved', () => {
    const state = { selected: 0, enabled: [0, 2] }
    expect(radioPress(state, 2)).toEqual({ type: 'select', index: 2, changed: true })
    expect(radioPress(state, 0)).toEqual({ type: 'select', index: 0, changed: false })
    expect(radioPress({ selected: -1, enabled: [0, 2] }, 0)).toEqual({
      type: 'select',
      index: 0,
      changed: true,
    })
  })

  it('a press on a disabled option (or in a disabled group) does nothing', () => {
    expect(radioPress({ selected: 0, enabled: [0, 2] }, 1)).toBeNull()
    expect(radioPress({ selected: 0, enabled: [] }, 0)).toBeNull()
    expect(radioPress({ selected: 0, enabled: [0, 2] }, 7)).toBeNull()
  })

  it('the tab stop is the selected option when it is enabled', () => {
    expect(radioTabStop({ selected: 2, enabled: [0, 1, 2] })).toBe(2)
  })

  it('with no selection the first enabled option is the tab stop', () => {
    expect(radioTabStop({ selected: -1, enabled: [0, 1, 2] })).toBe(0)
    expect(radioTabStop({ selected: -1, enabled: [1, 2] })).toBe(1)
  })

  it('a disabled selection hands the tab stop to the first enabled option', () => {
    expect(radioTabStop({ selected: 0, enabled: [1, 2] })).toBe(1)
  })

  it('nothing enabled → no tab stop', () => {
    expect(radioTabStop({ selected: 1, enabled: [] })).toBe(-1)
  })

  it('group attributes: role + a string aria-disabled only when disabled', () => {
    expect(radioGroupAttrs(false)).toEqual({ role: 'radiogroup', 'aria-disabled': undefined })
    expect(radioGroupAttrs(true)).toEqual({ role: 'radiogroup', 'aria-disabled': 'true' })
  })

  it('input attributes: roving tabindex, no role / aria-checked on the native radio', () => {
    expect(radioInputAttrs(1, 1)).toEqual({ tabindex: 0 })
    expect(radioInputAttrs(0, 1)).toEqual({ tabindex: -1 })
    expect(radioInputAttrs(0, 1)).not.toHaveProperty('aria-checked')
    expect(radioInputAttrs(0, 1)).not.toHaveProperty('role')
  })
})
