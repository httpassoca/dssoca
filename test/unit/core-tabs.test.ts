import { describe, it, expect } from 'vitest'
import {
  tabsKey,
  tabsListAttrs,
  tabsPanelAttrs,
  tabsPress,
  tabsSelected,
  tabsTabAttrs,
  tabsTabStop,
  type TabsKeyOptions,
  type TabsState,
} from '$lib/core/tabs'

/** Four tabs, index 1 disabled, index 0 selected. */
const state = (over: Partial<TabsState> = {}): TabsState => ({
  selected: 0,
  enabled: [0, 2, 3],
  ...over,
})

const act = (s: TabsState, index: number, key: string, opts?: TabsKeyOptions) =>
  tabsKey(s, index, key, opts)?.action

describe('core/tabs — press', () => {
  it('selects an enabled tab without moving focus', () => {
    expect(tabsPress(state(), 2)).toEqual({
      type: 'select',
      index: 2,
      changed: true,
      focus: false,
      reason: 'press',
    })
  })

  it('reports no change when the tab is already selected', () => {
    expect(tabsPress(state(), 0)).toMatchObject({ index: 0, changed: false })
  })

  it('ignores a disabled tab and an unknown index', () => {
    expect(tabsPress(state(), 1)).toBeNull()
    expect(tabsPress(state(), -1)).toBeNull()
    expect(tabsPress(state(), 9)).toBeNull()
  })
})

describe('core/tabs — keys, automatic activation', () => {
  it('arrows select and focus the next / previous enabled tab, skipping disabled ones', () => {
    expect(act(state(), 0, 'ArrowRight')).toEqual({
      type: 'select',
      index: 2,
      changed: true,
      focus: true,
      reason: 'key',
    })
    expect(act(state({ selected: 2 }), 2, 'ArrowLeft')).toMatchObject({ index: 0 })
  })

  it('wraps at both ends', () => {
    expect(act(state({ selected: 3 }), 3, 'ArrowRight')).toMatchObject({ index: 0 })
    expect(act(state(), 0, 'ArrowLeft')).toMatchObject({ index: 3 })
  })

  it('Home / End jump to the first / last enabled tab', () => {
    expect(act(state({ selected: 2 }), 2, 'Home')).toMatchObject({ index: 0 })
    expect(act(state(), 0, 'End')).toMatchObject({ index: 3 })
    expect(act(state({ enabled: [1, 2] }), 2, 'Home')).toMatchObject({ index: 1 })
  })

  it('swaps ArrowLeft / ArrowRight under RTL, leaving Home / End alone', () => {
    expect(act(state(), 0, 'ArrowLeft', { rtl: true })).toMatchObject({ index: 2 })
    expect(act(state({ selected: 2 }), 2, 'ArrowRight', { rtl: true })).toMatchObject({ index: 0 })
    expect(act(state(), 0, 'End', { rtl: true })).toMatchObject({ index: 3 })
  })

  it('cancels the default of the keys it handles', () => {
    expect(tabsKey(state(), 0, 'ArrowRight')?.preventDefault).toBe(true)
    expect(tabsKey(state(), 0, 'End')?.preventDefault).toBe(true)
  })

  it('lets every other key through, including Up / Down, Enter and Space', () => {
    for (const k of ['ArrowUp', 'ArrowDown', 'Enter', ' ', 'Tab', 'Escape', 'a']) {
      expect(tabsKey(state(), 0, k), k).toBeNull()
    }
  })

  it('steps from an edge when the focused tab is not enabled, and yields when none is', () => {
    expect(act(state(), 1, 'ArrowRight')).toMatchObject({ index: 0 })
    expect(act(state(), 1, 'ArrowLeft')).toMatchObject({ index: 3 })
    expect(tabsKey(state({ enabled: [] }), 0, 'ArrowRight')).toBeNull()
  })
})

describe('core/tabs — keys, manual activation', () => {
  const manual: TabsKeyOptions = { activation: 'manual' }

  it('arrows / Home / End only move focus', () => {
    expect(act(state(), 0, 'ArrowRight', manual)).toEqual({ type: 'focus', index: 2 })
    expect(act(state(), 0, 'ArrowLeft', manual)).toEqual({ type: 'focus', index: 3 })
    expect(act(state(), 2, 'Home', manual)).toEqual({ type: 'focus', index: 0 })
    expect(act(state(), 0, 'End', manual)).toEqual({ type: 'focus', index: 3 })
    expect(act(state(), 0, 'ArrowLeft', { ...manual, rtl: true })).toEqual({
      type: 'focus',
      index: 2,
    })
  })

  it('Enter / Space select the focused tab, reported as a key', () => {
    for (const k of ['Enter', ' ']) {
      expect(tabsKey(state(), 2, k, manual)).toEqual({
        action: { type: 'select', index: 2, changed: true, focus: false, reason: 'key' },
        preventDefault: true,
      })
    }
    expect(act(state(), 0, 'Enter', manual)).toMatchObject({ changed: false })
  })

  it('Enter / Space on a disabled tab do nothing', () => {
    expect(tabsKey(state(), 1, 'Enter', manual)).toBeNull()
  })
})

describe('core/tabs — selection and tab stop', () => {
  it('shows the first enabled tab when the value points at nothing', () => {
    expect(tabsSelected(2, [0, 2])).toBe(2)
    expect(tabsSelected(1, [0, 2])).toBe(1) // a disabled tab can still be the selection
    expect(tabsSelected(-1, [1, 2])).toBe(1)
    expect(tabsSelected(-1, [])).toBe(-1)
  })

  it('the tab stop is the selected tab, else the first enabled one', () => {
    expect(tabsTabStop(state({ selected: 2 }))).toBe(2)
    expect(tabsTabStop(state({ selected: 1 }))).toBe(0)
    expect(tabsTabStop(state({ selected: -1 }))).toBe(0)
    expect(tabsTabStop(state({ selected: -1, enabled: [] }))).toBe(-1)
  })
})

describe('core/tabs — attributes', () => {
  it('list, tab and panel carry the tabs roles and wiring', () => {
    expect(tabsListAttrs()).toEqual({ role: 'tablist' })
    expect(tabsTabAttrs({ index: 0, selected: 0, tabStop: 0, panelId: 'p0' })).toEqual({
      role: 'tab',
      'aria-selected': 'true',
      'aria-controls': 'p0',
      tabindex: 0,
    })
    expect(tabsTabAttrs({ index: 1, selected: 0, tabStop: 0 })).toEqual({
      role: 'tab',
      'aria-selected': 'false',
      'aria-controls': undefined,
      tabindex: -1,
    })
    expect(tabsPanelAttrs('t0')).toEqual({
      role: 'tabpanel',
      'aria-labelledby': 't0',
      tabindex: 0,
    })
  })
})
