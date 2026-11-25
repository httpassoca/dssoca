import { describe, it, expect } from 'vitest'
import {
  bottomNavHasBadge,
  bottomNavPress,
  bottomNavTabAttrs,
  bottomNavTabElement,
  type BottomNavTab,
} from '$lib/core/bottom-nav'

const tab = (over: Partial<BottomNavTab> = {}): BottomNavTab => ({
  id: 'home',
  label: 'Home',
  ...over,
})

describe('core/bottom-nav — element', () => {
  it('is a link only with an href and while enabled', () => {
    expect(bottomNavTabElement(tab({ href: '/home' }))).toBe('a')
    expect(bottomNavTabElement(tab())).toBe('button')
    expect(bottomNavTabElement(tab({ href: '' }))).toBe('button')
  })

  it('falls back to a button for a disabled href tab', () => {
    expect(bottomNavTabElement(tab({ href: '/home', disabled: true }))).toBe('button')
  })
})

describe('core/bottom-nav — press', () => {
  it('selects and cancels the default on a tab without href', () => {
    expect(bottomNavPress(tab())).toEqual({ select: true, preventDefault: true })
  })

  it('selects and lets an href tab navigate natively', () => {
    expect(bottomNavPress(tab({ href: '/home' }))).toEqual({ select: true, preventDefault: false })
  })

  it('is inert when disabled, with or without href', () => {
    expect(bottomNavPress(tab({ disabled: true }))).toEqual({ select: false, preventDefault: true })
    expect(bottomNavPress(tab({ href: '/home', disabled: true }))).toEqual({
      select: false,
      preventDefault: true,
    })
  })
})

describe('core/bottom-nav — badge and attributes', () => {
  it('has a badge for any non-empty value, including 0', () => {
    expect(bottomNavHasBadge(tab({ badge: 3 }))).toBe(true)
    expect(bottomNavHasBadge(tab({ badge: 0 }))).toBe(true)
    expect(bottomNavHasBadge(tab({ badge: 'new' }))).toBe(true)
    expect(bottomNavHasBadge(tab({ badge: '' }))).toBe(false)
    expect(bottomNavHasBadge(tab())).toBe(false)
  })

  it('marks the active tab as the current page', () => {
    expect(bottomNavTabAttrs(tab(), 'home')['aria-current']).toBe('page')
    expect(bottomNavTabAttrs(tab(), 'other')['aria-current']).toBeUndefined()
    expect(bottomNavTabAttrs(tab(), undefined)['aria-current']).toBeUndefined()
  })

  it('folds the badge into the accessible name, and leaves the name alone without one', () => {
    expect(bottomNavTabAttrs(tab({ badge: 3 }), undefined)['aria-label']).toBe('Home, 3')
    expect(bottomNavTabAttrs(tab(), undefined)['aria-label']).toBeUndefined()
  })

  it('reflects disabled as a string aria-disabled', () => {
    expect(bottomNavTabAttrs(tab({ disabled: true }), undefined)['aria-disabled']).toBe('true')
    expect(bottomNavTabAttrs(tab(), undefined)['aria-disabled']).toBeUndefined()
  })
})
