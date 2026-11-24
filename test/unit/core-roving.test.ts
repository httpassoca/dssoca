import { describe, it, expect } from 'vitest'
import { rovingStep, rovingTabindex } from '$lib/core/behaviors/roving'

describe('core/behaviors/roving — rovingStep', () => {
  const enabled = [0, 2, 3] // index 1 is disabled

  it('first / last jump to the ends', () => {
    expect(rovingStep(enabled, 2, 'first')).toBe(0)
    expect(rovingStep(enabled, 0, 'last')).toBe(3)
  })

  it('next / prev skip disabled indexes', () => {
    expect(rovingStep(enabled, 0, 'next')).toBe(2)
    expect(rovingStep(enabled, 2, 'prev')).toBe(0)
  })

  it('wraps at both ends', () => {
    expect(rovingStep(enabled, 3, 'next')).toBe(0)
    expect(rovingStep(enabled, 0, 'prev')).toBe(3)
  })

  it('with nothing focused, next starts at the first and prev at the last', () => {
    expect(rovingStep(enabled, -1, 'next')).toBe(0)
    expect(rovingStep(enabled, -1, 'prev')).toBe(3)
  })

  it('moves off a disabled active index to its enabled neighbour', () => {
    expect(rovingStep(enabled, 1, 'next')).toBe(2)
    expect(rovingStep(enabled, 1, 'prev')).toBe(0)
  })

  it('returns -1 when nothing is focusable', () => {
    for (const move of ['next', 'prev', 'first', 'last'] as const) {
      expect(rovingStep([], 0, move)).toBe(-1)
    }
  })
})

describe('core/behaviors/roving — rovingTabindex', () => {
  it('only the active item is a tab stop', () => {
    expect(rovingTabindex(2, 2)).toBe(0)
    expect(rovingTabindex(1, 2)).toBe(-1)
    expect(rovingTabindex(0, -1)).toBe(-1)
  })
})
