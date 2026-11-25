import { describe, it, expect } from 'vitest'
import {
  segmentedGroupAttrs,
  segmentedItemAttrs,
  segmentedKey,
  segmentedPress,
  segmentedTabStop,
  type SegmentedState,
} from '$lib/core/segmented'

/** Four segments, index 1 disabled, index 0 selected. */
const state = (over: Partial<SegmentedState> = {}): SegmentedState => ({
  selected: 0,
  enabled: [0, 2, 3],
  ...over,
})

const target = (s: SegmentedState, index: number, key: string, rtl = false) =>
  segmentedKey(s, index, key, rtl)?.action.index

describe('core/segmented — press', () => {
  it('selects an enabled segment without moving focus', () => {
    expect(segmentedPress(state(), 2)).toEqual({
      type: 'select',
      index: 2,
      changed: true,
      focus: false,
      reason: 'press',
    })
  })

  it('reports no change when the segment is already selected', () => {
    expect(segmentedPress(state(), 0)).toMatchObject({ index: 0, changed: false })
  })

  it('ignores a disabled segment, an unknown index and a disabled group', () => {
    expect(segmentedPress(state(), 1)).toBeNull()
    expect(segmentedPress(state(), -1)).toBeNull()
    expect(segmentedPress(state(), 9)).toBeNull()
    expect(segmentedPress(state({ enabled: [] }), 0)).toBeNull()
  })
})

describe('core/segmented — keys', () => {
  it('ArrowRight / ArrowDown select the next enabled segment, skipping disabled', () => {
    expect(target(state(), 0, 'ArrowRight')).toBe(2)
    expect(target(state(), 0, 'ArrowDown')).toBe(2)
  })

  it('ArrowLeft / ArrowUp select the previous enabled segment, skipping disabled', () => {
    expect(target(state(), 2, 'ArrowLeft')).toBe(0)
    expect(target(state(), 2, 'ArrowUp')).toBe(0)
  })

  it('wraps at both ends', () => {
    expect(target(state(), 3, 'ArrowRight')).toBe(0)
    expect(target(state(), 0, 'ArrowLeft')).toBe(3)
  })

  it('Home / End select the first / last enabled segment', () => {
    expect(target(state({ enabled: [1, 2] }), 2, 'Home')).toBe(1)
    expect(target(state({ enabled: [0, 2] }), 0, 'End')).toBe(2)
  })

  it('mirrors ArrowLeft / ArrowRight under RTL', () => {
    expect(target(state(), 0, 'ArrowLeft', true)).toBe(2)
    expect(target(state(), 2, 'ArrowRight', true)).toBe(0)
    expect(target(state(), 0, 'ArrowRight', true)).toBe(3)
  })

  it('keeps ArrowUp / ArrowDown / Home / End logical under RTL', () => {
    expect(target(state(), 0, 'ArrowDown', true)).toBe(2)
    expect(target(state(), 2, 'ArrowUp', true)).toBe(0)
    expect(target(state(), 2, 'Home', true)).toBe(0)
    expect(target(state(), 0, 'End', true)).toBe(3)
  })

  it('a handled key selects, moves focus, cancels the default and says why', () => {
    expect(segmentedKey(state(), 0, 'ArrowRight')).toEqual({
      action: { type: 'select', index: 2, changed: true, focus: true, reason: 'key' },
      preventDefault: true,
    })
  })

  it('still handles the key (focus, no change) when the target is already selected', () => {
    expect(segmentedKey(state({ selected: 0 }), 3, 'ArrowRight')).toEqual({
      action: { type: 'select', index: 0, changed: false, focus: true, reason: 'key' },
      preventDefault: true,
    })
    expect(segmentedKey(state({ enabled: [0] }), 0, 'ArrowRight')?.action).toMatchObject({
      index: 0,
      changed: false,
    })
  })

  it('steps from an edge when the origin is not an enabled segment', () => {
    expect(target(state(), 1, 'ArrowRight')).toBe(0)
    expect(target(state(), 1, 'ArrowLeft')).toBe(3)
    expect(target(state(), -1, 'ArrowDown')).toBe(0)
  })

  it('lets other keys through', () => {
    for (const key of ['Enter', ' ', 'Tab', 'Escape', 'a', 'PageDown']) {
      expect(segmentedKey(state(), 0, key)).toBeNull()
    }
  })

  it('lets every key through when nothing is enabled', () => {
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End']) {
      expect(segmentedKey(state({ enabled: [] }), 0, key)).toBeNull()
    }
  })
})

describe('core/segmented — tab stop', () => {
  it('is the selected segment when it is enabled', () => {
    expect(segmentedTabStop(state({ selected: 2 }))).toBe(2)
  })

  it('falls back to the first enabled segment (nothing selected, or selection disabled)', () => {
    expect(segmentedTabStop(state({ selected: -1 }))).toBe(0)
    expect(segmentedTabStop(state({ selected: 1 }))).toBe(0)
    expect(segmentedTabStop({ selected: 0, enabled: [2, 3] })).toBe(2)
  })

  it('is -1 when nothing is enabled', () => {
    expect(segmentedTabStop(state({ enabled: [] }))).toBe(-1)
  })
})

describe('core/segmented — attributes', () => {
  it('group: radiogroup, aria-disabled only when disabled', () => {
    expect(segmentedGroupAttrs(false)).toEqual({ role: 'radiogroup', 'aria-disabled': undefined })
    expect(segmentedGroupAttrs(true)).toEqual({ role: 'radiogroup', 'aria-disabled': 'true' })
  })

  it('item: radio with a string aria-checked and a roving tabindex', () => {
    expect(segmentedItemAttrs(0, 0, 0)).toEqual({
      role: 'radio',
      'aria-checked': 'true',
      tabindex: 0,
    })
    expect(segmentedItemAttrs(1, 0, 0)).toEqual({
      role: 'radio',
      'aria-checked': 'false',
      tabindex: -1,
    })
    // Selection disabled: the tab stop sits on another segment.
    expect(segmentedItemAttrs(2, 1, 2)).toMatchObject({ 'aria-checked': 'false', tabindex: 0 })
    expect(segmentedItemAttrs(1, 1, 2)).toMatchObject({ 'aria-checked': 'true', tabindex: -1 })
  })
})
