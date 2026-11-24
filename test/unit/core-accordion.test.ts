import { describe, it, expect } from 'vitest'
import {
  accordionHeaderAttrs,
  accordionHeaderKey,
  accordionOpenIds,
  accordionToggle,
  accordionValue,
} from '$lib/core/accordion'

describe('core/accordion — value shapes', () => {
  it('normalises a public value into open ids', () => {
    expect(accordionOpenIds(undefined)).toEqual([])
    expect(accordionOpenIds('a')).toEqual(['a'])
    expect(accordionOpenIds(['a', 'b'])).toEqual(['a', 'b'])
    expect(accordionOpenIds([])).toEqual([])
  })

  it('drops duplicate ids and never aliases the input array', () => {
    const input = ['a', 'b', 'a']
    const ids = accordionOpenIds(input)
    expect(ids).toEqual(['a', 'b'])
    expect(ids).not.toBe(input)
  })

  it('projects open ids to one id in single mode, a list in multiple mode', () => {
    expect(accordionValue([], false)).toBeUndefined()
    expect(accordionValue(['a'], false)).toBe('a')
    expect(accordionValue(['a', 'b'], false)).toBe('a')
    expect(accordionValue([], true)).toEqual([])
    expect(accordionValue(['a', 'b'], true)).toEqual(['a', 'b'])
  })
})

describe('core/accordion — toggle', () => {
  it('single mode: opening one closes the others', () => {
    expect(accordionToggle({ open: [], multiple: false }, 'a')).toEqual(['a'])
    expect(accordionToggle({ open: ['a'], multiple: false }, 'b')).toEqual(['b'])
  })

  it('single mode: pressing the open section closes it', () => {
    expect(accordionToggle({ open: ['a'], multiple: false }, 'a')).toEqual([])
  })

  it('multiple mode: opening appends, closing keeps the rest', () => {
    expect(accordionToggle({ open: ['a'], multiple: true }, 'b')).toEqual(['a', 'b'])
    expect(accordionToggle({ open: ['a', 'b', 'c'], multiple: true }, 'b')).toEqual(['a', 'c'])
  })

  it('a disabled section never changes anything', () => {
    expect(accordionToggle({ open: [], multiple: false }, 'a', true)).toBeNull()
    expect(accordionToggle({ open: ['a'], multiple: true }, 'a', true)).toBeNull()
  })

  it('does not mutate the state it was given', () => {
    const open = Object.freeze(['a'])
    accordionToggle({ open, multiple: true }, 'b')
    accordionToggle({ open, multiple: false }, 'a')
    expect(open).toEqual(['a'])
  })
})

describe('core/accordion — header keys', () => {
  it('ArrowDown / ArrowUp move to the neighbouring header', () => {
    expect(accordionHeaderKey(3, 0, 'ArrowDown')).toEqual({ focus: 1, preventDefault: true })
    expect(accordionHeaderKey(3, 2, 'ArrowUp')).toEqual({ focus: 1, preventDefault: true })
  })

  it('wraps at both ends', () => {
    expect(accordionHeaderKey(3, 2, 'ArrowDown')?.focus).toBe(0)
    expect(accordionHeaderKey(3, 0, 'ArrowUp')?.focus).toBe(2)
  })

  it('Home / End jump to the first / last header', () => {
    expect(accordionHeaderKey(3, 1, 'Home')?.focus).toBe(0)
    expect(accordionHeaderKey(3, 1, 'End')?.focus).toBe(2)
  })

  it('lets every other key through (Enter / Space activate the native button)', () => {
    for (const key of ['Enter', ' ', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'a']) {
      expect(accordionHeaderKey(3, 0, key)).toBeNull()
    }
    // Not fooled by inherited object keys.
    expect(accordionHeaderKey(3, 0, 'toString')).toBeNull()
    expect(accordionHeaderKey(3, 0, 'constructor')).toBeNull()
  })

  it('handles nothing when there are no headers', () => {
    expect(accordionHeaderKey(0, 0, 'ArrowDown')).toBeNull()
  })

  it('a single header keeps focus on itself', () => {
    expect(accordionHeaderKey(1, 0, 'ArrowDown')?.focus).toBe(0)
    expect(accordionHeaderKey(1, 0, 'ArrowUp')?.focus).toBe(0)
  })
})

describe('core/accordion — attributes', () => {
  it('reflects the state as strings; aria-disabled only when disabled', () => {
    expect(accordionHeaderAttrs(true)).toEqual({
      'aria-expanded': 'true',
      'aria-disabled': undefined,
    })
    expect(accordionHeaderAttrs(false, true)).toEqual({
      'aria-expanded': 'false',
      'aria-disabled': 'true',
    })
  })
})
