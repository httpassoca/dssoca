import { describe, it, expect } from 'vitest'
import {
  tooltipDescribedBy,
  tooltipFocusIn,
  tooltipFocusOut,
  tooltipKey,
  tooltipPointerEnter,
  tooltipPointerLeave,
} from '$lib/core/tooltip'

const closed = { open: false }
const opened = { open: true }
const show = { type: 'show' }
const hide = { type: 'hide' }

describe('core/tooltip — pointer', () => {
  it('shows when the pointer enters from outside', () => {
    expect(tooltipPointerEnter(closed)).toEqual(show)
    expect(tooltipPointerEnter(closed, { within: false })).toEqual(show)
  })

  it('shows again while open, so the described element is re-resolved', () => {
    expect(tooltipPointerEnter(opened)).toEqual(show)
  })

  it('ignores pointer moves between parts of the tooltip', () => {
    expect(tooltipPointerEnter(opened, { within: true })).toBeNull()
    expect(tooltipPointerEnter(closed, { within: true })).toBeNull()
  })

  it('hides when the pointer leaves the tooltip', () => {
    expect(tooltipPointerLeave(opened)).toEqual(hide)
    expect(tooltipPointerLeave(opened, { within: false })).toEqual(hide)
  })

  it('stays open while the pointer moves onto the tip (hoverable, WCAG 1.4.13)', () => {
    expect(tooltipPointerLeave(opened, { within: true })).toBeNull()
  })

  it('has nothing to hide when closed', () => {
    expect(tooltipPointerLeave(closed)).toBeNull()
  })
})

describe('core/tooltip — focus', () => {
  it('shows on focus, also when already open (focus moved to another trigger element)', () => {
    expect(tooltipFocusIn(closed)).toEqual(show)
    expect(tooltipFocusIn(opened)).toEqual(show)
  })

  it('hides when focus leaves the tooltip', () => {
    expect(tooltipFocusOut(opened)).toEqual(hide)
    expect(tooltipFocusOut(opened, { within: false })).toEqual(hide)
  })

  it('stays open while focus moves inside the tooltip', () => {
    expect(tooltipFocusOut(opened, { within: true })).toBeNull()
  })

  it('has nothing to hide when closed', () => {
    expect(tooltipFocusOut(closed)).toBeNull()
  })
})

describe('core/tooltip — keys', () => {
  it('Escape hides an open tip (dismissable, WCAG 1.4.13)', () => {
    expect(tooltipKey(opened, 'Escape')).toEqual(hide)
  })

  it('Escape does nothing while closed', () => {
    expect(tooltipKey(closed, 'Escape')).toBeNull()
  })

  it.each(['a', 'Enter', ' ', 'Tab', 'ArrowDown', 'Esc'])('%j is not a tooltip key', (key) => {
    expect(tooltipKey(opened, key)).toBeNull()
  })
})

describe('core/tooltip — aria-describedby', () => {
  it('adds the tip id while open', () => {
    expect(tooltipDescribedBy(null, 'tip', true)).toBe('tip')
    expect(tooltipDescribedBy(undefined, 'tip', true)).toBe('tip')
    expect(tooltipDescribedBy('', 'tip', true)).toBe('tip')
  })

  it("keeps the element's own description tokens", () => {
    expect(tooltipDescribedBy('hint  err', 'tip', true)).toBe('hint err tip')
  })

  it('never lists the tip id twice', () => {
    expect(tooltipDescribedBy('hint tip', 'tip', true)).toBe('hint tip')
  })

  it('removes only the tip id while closed', () => {
    expect(tooltipDescribedBy('hint tip err', 'tip', false)).toBe('hint err')
  })

  it('returns undefined (remove the attribute) when nothing is left', () => {
    expect(tooltipDescribedBy('tip', 'tip', false)).toBeUndefined()
    expect(tooltipDescribedBy(null, 'tip', false)).toBeUndefined()
  })
})
