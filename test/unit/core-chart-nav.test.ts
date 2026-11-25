import { describe, expect, it } from 'vitest'
import {
  chartMarkKey,
  chartNavStep,
  chartTabStop,
  chartWindowKey,
} from '../../src/lib/core/chart-nav'

describe('chartNavStep', () => {
  it('moves linearly in 1-D and clamps at the edges', () => {
    expect(chartNavStep('ArrowRight', 0, 3)).toBe(1)
    expect(chartNavStep('ArrowDown', 1, 3)).toBe(2)
    expect(chartNavStep('ArrowRight', 2, 3)).toBe(2)
    expect(chartNavStep('ArrowLeft', 0, 3)).toBe(0)
    expect(chartNavStep('ArrowUp', 2, 3)).toBe(1)
  })

  it('jumps to the ends with Home/End', () => {
    expect(chartNavStep('Home', 2, 5)).toBe(0)
    expect(chartNavStep('End', 0, 5)).toBe(4)
  })

  it('moves by rows in 2-D and stays put past the top/bottom row', () => {
    // 3 columns × 2 rows
    expect(chartNavStep('ArrowDown', 1, 6, 3)).toBe(4)
    expect(chartNavStep('ArrowDown', 4, 6, 3)).toBe(4)
    expect(chartNavStep('ArrowUp', 4, 6, 3)).toBe(1)
    expect(chartNavStep('ArrowUp', 1, 6, 3)).toBe(1)
    expect(chartNavStep('ArrowRight', 2, 6, 3)).toBe(3)
  })

  it('ignores non-navigation keys and empty charts', () => {
    expect(chartNavStep('Enter', 0, 3)).toBeNull()
    expect(chartNavStep('ArrowRight', 0, 0)).toBeNull()
  })
})

describe('chartMarkKey', () => {
  it('turns a navigation key into a focus action and cancels the default', () => {
    expect(chartMarkKey({ index: 0, count: 3 }, 'ArrowRight')).toEqual({
      action: { type: 'focus', index: 1 },
      preventDefault: true,
    })
    expect(chartMarkKey({ index: 1, count: 3 }, 'End')).toEqual({
      action: { type: 'focus', index: 2 },
      preventDefault: true,
    })
  })

  it('still claims a navigation key at the edge, so the page does not scroll', () => {
    expect(chartMarkKey({ index: 2, count: 3 }, 'ArrowRight')).toEqual({
      action: { type: 'focus', index: 2 },
      preventDefault: true,
    })
  })

  it('moves by rows when the chart is a grid', () => {
    expect(chartMarkKey({ index: 1, count: 6, cols: 3 }, 'ArrowDown')?.action).toEqual({
      type: 'focus',
      index: 4,
    })
  })

  it('lets every other key through', () => {
    expect(chartMarkKey({ index: 0, count: 3 }, 'Enter')).toBeNull()
    expect(chartMarkKey({ index: 0, count: 3 }, ' ')).toBeNull()
    expect(chartMarkKey({ index: 0, count: 3 }, 'Tab')).toBeNull()
    expect(chartMarkKey({ index: 0, count: 0 }, 'ArrowRight')).toBeNull()
  })

  it('leaves Escape to the window handler unless the mark asks for it', () => {
    expect(chartMarkKey({ index: 0, count: 3 }, 'Escape')).toBeNull()
    expect(chartMarkKey({ index: 0, count: 3, tooltipOpen: true }, 'Escape')).toBeNull()
  })

  it("escape: 'dismiss' hides the tooltip and lets the key carry on", () => {
    expect(chartMarkKey({ index: 0, count: 3, escape: 'dismiss' }, 'Escape')).toEqual({
      action: { type: 'dismiss' },
      preventDefault: false,
    })
    // Even on an empty chart: Escape is not a navigation key.
    expect(chartMarkKey({ index: 0, count: 0, escape: 'dismiss' }, 'Escape')).toEqual({
      action: { type: 'dismiss' },
      preventDefault: false,
    })
  })

  it("escape: 'consume' cancels the key only while a tooltip is showing", () => {
    const state = { index: 0, count: 3, escape: 'consume' as const }
    expect(chartMarkKey({ ...state, tooltipOpen: true }, 'Escape')).toEqual({
      action: { type: 'dismiss' },
      preventDefault: true,
    })
    expect(chartMarkKey({ ...state, tooltipOpen: false }, 'Escape')).toBeNull()
    expect(chartMarkKey(state, 'Escape')).toBeNull()
  })
})

describe('chartWindowKey', () => {
  it('dismisses an open tooltip on Escape', () => {
    expect(chartWindowKey(true, 'Escape')).toEqual({ type: 'dismiss' })
  })

  it('does nothing without a tooltip or for another key', () => {
    expect(chartWindowKey(false, 'Escape')).toBeNull()
    expect(chartWindowKey(true, 'Enter')).toBeNull()
    expect(chartWindowKey(true, 'ArrowRight')).toBeNull()
  })
})

describe('chartTabStop', () => {
  it('is the last focused mark, clamped to the marks that exist', () => {
    expect(chartTabStop(0, 4)).toBe(0)
    expect(chartTabStop(2, 4)).toBe(2)
    expect(chartTabStop(9, 4)).toBe(3)
    expect(chartTabStop(3, 0)).toBe(0)
  })
})
