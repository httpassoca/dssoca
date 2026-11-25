import { describe, it, expect } from 'vitest'
import {
  SIDEBAR_STATUS_WORD,
  sidebarActiveWithin,
  sidebarCollapsePress,
  sidebarDisclosureAttrs,
  sidebarDisclosureOpen,
  sidebarDisclosurePress,
  sidebarHasBadge,
  sidebarIsActive,
  sidebarItemAttrs,
  sidebarItemKey,
  sidebarItemName,
  sidebarToggleAttrs,
  type SidebarItemLike,
} from '$lib/core/sidebar'

const parent: SidebarItemLike = {
  id: 'media',
  label: 'Media',
  children: [
    { id: 'movies', label: 'Movies' },
    { id: 'music', label: 'Music' },
  ],
}

describe('core/sidebar — names', () => {
  it('status words: up is silent', () => {
    expect(SIDEBAR_STATUS_WORD).toEqual({ up: '', deg: 'degraded', down: 'down' })
  })

  it('a badge renders for any value but null / undefined / empty string', () => {
    expect(sidebarHasBadge(0)).toBe(true)
    expect(sidebarHasBadge('new')).toBe(true)
    expect(sidebarHasBadge('')).toBe(false)
    expect(sidebarHasBadge(undefined)).toBe(false)
    expect(sidebarHasBadge(null)).toBe(false)
  })

  it('the collapsed name keeps label, status, badge and the new-tab hint', () => {
    expect(sidebarItemName({ id: 'a', label: 'Hub' })).toBe('Hub')
    expect(sidebarItemName({ id: 'a', label: 'Hub', status: 'up' })).toBe('Hub')
    expect(
      sidebarItemName({ id: 'a', label: 'Hub', status: 'deg', badge: 3, external: true }),
    ).toBe('Hub, degraded, 3, opens in a new tab')
    expect(sidebarItemName({ id: 'a', label: 'Hub', status: 'down', badge: 0 })).toBe(
      'Hub, down, 0',
    )
  })
})

describe('core/sidebar — active item and disclosures', () => {
  it('an item is active by id', () => {
    expect(sidebarIsActive(parent, 'media')).toBe(true)
    expect(sidebarIsActive(parent, 'movies')).toBe(false)
    expect(sidebarIsActive(parent, undefined)).toBe(false)
  })

  it('a parent is active-within when it or a child is active', () => {
    expect(sidebarActiveWithin(parent, 'media')).toBe(true)
    expect(sidebarActiveWithin(parent, 'music')).toBe(true)
    expect(sidebarActiveWithin(parent, 'hub')).toBe(false)
    expect(sidebarActiveWithin({ id: 'x', label: 'X' }, 'hub')).toBe(false)
  })

  it('a disclosure follows the active item until the user toggles it', () => {
    expect(sidebarDisclosureOpen(parent, 'music', undefined)).toBe(true)
    expect(sidebarDisclosureOpen(parent, 'hub', undefined)).toBe(false)
    expect(sidebarDisclosureOpen(parent, 'music', false)).toBe(false)
    expect(sidebarDisclosureOpen(parent, 'hub', true)).toBe(true)
  })

  it('a press flips what is currently shown', () => {
    expect(sidebarDisclosurePress(parent, 'music', undefined)).toBe(false)
    expect(sidebarDisclosurePress(parent, 'hub', undefined)).toBe(true)
    expect(sidebarDisclosurePress(parent, 'hub', true)).toBe(false)
    expect(sidebarDisclosurePress(parent, 'music', false)).toBe(true)
  })

  it('the collapse toggle reports the opposite state', () => {
    expect(sidebarCollapsePress(false)).toBe(true)
    expect(sidebarCollapsePress(true)).toBe(false)
  })
})

describe('core/sidebar — keys', () => {
  it.each(['Enter', ' '])('%j selects a button-like item and cancels the default', (key) => {
    expect(sidebarItemKey(key)).toEqual({ action: { type: 'select' }, preventDefault: true })
  })

  it.each(['Tab', 'Escape', 'ArrowDown', 'a'])('%j is left to the browser', (key) => {
    expect(sidebarItemKey(key)).toBeNull()
  })
})

describe('core/sidebar — attributes', () => {
  it('the collapse toggle is expanded when the rail is not collapsed', () => {
    expect(sidebarToggleAttrs(false)).toEqual({ 'aria-expanded': 'true' })
    expect(sidebarToggleAttrs(true)).toEqual({ 'aria-expanded': 'false' })
  })

  it('a disclosure points at its panel', () => {
    expect(sidebarDisclosureAttrs(true, 'p1')).toEqual({
      'aria-expanded': 'true',
      'aria-controls': 'p1',
    })
    expect(sidebarDisclosureAttrs(false, 'p1')['aria-expanded']).toBe('false')
  })

  it('an item marks the current page and is only force-named in the collapsed rail', () => {
    const item: SidebarItemLike = { id: 'hub', label: 'Hub', status: 'down' }
    expect(sidebarItemAttrs(item, 'hub', false)).toEqual({
      'aria-current': 'page',
      'aria-label': undefined,
      title: undefined,
    })
    expect(sidebarItemAttrs(item, 'other', true)).toEqual({
      'aria-current': undefined,
      'aria-label': 'Hub, down',
      title: 'Hub, down',
    })
  })
})
