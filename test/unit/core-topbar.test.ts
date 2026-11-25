import { describe, it, expect } from 'vitest'
import { topbarRovingIndex, topbarTabKey, topbarTabs, topbarTabTabindex } from '$lib/core/topbar'

describe('core/topbar — tabs', () => {
  it('normalizes string and object tabs', () => {
    expect(
      topbarTabs(['logs', { id: 'home', label: 'Início' }, { id: 'docs', href: '/d' }]),
    ).toEqual([
      { id: 'logs', label: 'logs' },
      { id: 'home', label: 'Início', href: undefined },
      { id: 'docs', label: 'docs', href: '/d' },
    ])
    expect(topbarTabs([])).toEqual([])
  })

  const tabs = topbarTabs([{ id: 'a', href: '/a' }, 'b', 'c'])

  it('the roving tab stop is the active tab', () => {
    expect(topbarRovingIndex(tabs, 'c')).toBe(2)
    expect(topbarRovingIndex(tabs, 'a')).toBe(0)
  })

  it('falls back to the first button tab when active matches nothing', () => {
    expect(topbarRovingIndex(tabs, 'nope')).toBe(1)
    expect(topbarRovingIndex(tabs, undefined)).toBe(1)
    expect(topbarRovingIndex(topbarTabs([{ id: 'a', href: '/a' }]), 'nope')).toBe(-1)
    expect(topbarRovingIndex([], 'x')).toBe(-1)
  })

  it('button tabs rove; link tabs keep their natural tab order', () => {
    expect(topbarTabTabindex(tabs[1], 1, 1)).toBe(0)
    expect(topbarTabTabindex(tabs[2], 2, 1)).toBe(-1)
    expect(topbarTabTabindex(tabs[0], 0, 0)).toBeUndefined()
  })
})

describe('core/topbar — tab keys', () => {
  const focus = (index: number) => ({ action: { type: 'focus', index }, preventDefault: true })

  it.each(['ArrowRight', 'ArrowDown'])('%s moves to the next tab, wrapping', (key) => {
    expect(topbarTabKey(key, 0, 3)).toEqual(focus(1))
    expect(topbarTabKey(key, 2, 3)).toEqual(focus(0))
  })

  it.each(['ArrowLeft', 'ArrowUp'])('%s moves to the previous tab, wrapping', (key) => {
    expect(topbarTabKey(key, 2, 3)).toEqual(focus(1))
    expect(topbarTabKey(key, 0, 3)).toEqual(focus(2))
  })

  it('Home / End jump to the ends', () => {
    expect(topbarTabKey('Home', 2, 3)).toEqual(focus(0))
    expect(topbarTabKey('End', 0, 3)).toEqual(focus(2))
  })

  it('a single tab keeps focus on itself', () => {
    expect(topbarTabKey('ArrowRight', 0, 1)).toEqual(focus(0))
  })

  it('with no tabs the key is still claimed but nothing is focused', () => {
    expect(topbarTabKey('ArrowRight', 0, 0)).toEqual({ action: null, preventDefault: true })
  })

  it.each(['Enter', ' ', 'Tab', 'Escape', 'a', 'toString'])('%j is left to the browser', (key) => {
    expect(topbarTabKey(key, 0, 3)).toBeNull()
  })
})
