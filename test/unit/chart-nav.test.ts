import { describe, expect, it } from 'vitest'
import { chartNavStep } from '../../src/lib/chart-nav'

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
