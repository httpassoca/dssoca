import { describe, it, expect } from 'vitest'
import {
  paginationClamp,
  paginationIsGap,
  paginationPageAttrs,
  paginationPageCount,
  paginationPagePress,
  paginationSlots,
  paginationStep,
  paginationStepperDisabled,
  type PaginationState,
} from '$lib/core/pagination'

const at = (current: number, pages = 10, disabled = false): PaginationState => ({
  current,
  pages,
  disabled,
})

describe('core/pagination — page count and bounds', () => {
  it('prefers an explicit page count', () => {
    expect(paginationPageCount({ pageCount: 7, total: 500, pageSize: 10 })).toBe(7)
  })

  it('derives the count from total / pageSize, rounding up', () => {
    expect(paginationPageCount({ total: 240, pageSize: 20 })).toBe(12)
    expect(paginationPageCount({ total: 241, pageSize: 20 })).toBe(13)
  })

  it('never derives fewer than one page', () => {
    expect(paginationPageCount({ total: 0, pageSize: 10 })).toBe(1)
    expect(paginationPageCount({ pageSize: 10 })).toBe(1)
  })

  it('clamps the page into [1, pages]', () => {
    expect(paginationClamp(0, 5)).toBe(1)
    expect(paginationClamp(-3, 5)).toBe(1)
    expect(paginationClamp(3, 5)).toBe(3)
    expect(paginationClamp(99, 5)).toBe(5)
  })
})

describe('core/pagination — slot window', () => {
  it('lists every page when there are few', () => {
    expect(paginationSlots(1, 4, 1)).toEqual([1, 2, 3, 4])
    expect(paginationSlots(1, 1, 1)).toEqual([1])
    expect(paginationSlots(2, 2, 1)).toEqual([1, 2])
  })

  it('collapses the far run when near the start', () => {
    expect(paginationSlots(1, 10, 1)).toEqual([1, 2, 'gap-end', 10])
    expect(paginationSlots(2, 10, 1)).toEqual([1, 2, 3, 'gap-end', 10])
  })

  it('collapses the near run when near the end', () => {
    expect(paginationSlots(10, 10, 1)).toEqual([1, 'gap-start', 9, 10])
    expect(paginationSlots(9, 10, 1)).toEqual([1, 'gap-start', 8, 9, 10])
  })

  it('shows both ellipses in the middle', () => {
    expect(paginationSlots(5, 10, 1)).toEqual([1, 'gap-start', 4, 5, 6, 'gap-end', 10])
  })

  it('shows a single hidden page instead of an ellipsis', () => {
    // Page 2 alone would be hidden on the left, page 9 alone on the right.
    expect(paginationSlots(4, 10, 1)).toEqual([1, 2, 3, 4, 5, 'gap-end', 10])
    expect(paginationSlots(7, 10, 1)).toEqual([1, 'gap-start', 6, 7, 8, 9, 10])
  })

  it('widens the window with siblingCount', () => {
    expect(paginationSlots(10, 20, 2)).toEqual([1, 'gap-start', 8, 9, 10, 11, 12, 'gap-end', 20])
    expect(paginationSlots(5, 10, 0)).toEqual([1, 'gap-start', 5, 'gap-end', 10])
  })

  it('never repeats a slot (they key the list) and always shows the current page', () => {
    for (let pages = 1; pages <= 12; pages++) {
      for (let current = 1; current <= pages; current++) {
        for (const siblings of [0, 1, 2, 3]) {
          const slots = paginationSlots(current, pages, siblings)
          expect(new Set(slots).size, `${current}/${pages}/${siblings}`).toBe(slots.length)
          expect(slots).toContain(current)
        }
      }
    }
  })

  it('tells gaps from pages', () => {
    expect(paginationIsGap('gap-start')).toBe(true)
    expect(paginationIsGap('gap-end')).toBe(true)
    expect(paginationIsGap(3)).toBe(false)
  })
})

describe('core/pagination — presses', () => {
  it('a page press goes to that page', () => {
    expect(paginationPagePress(at(2), 7)).toEqual({ page: 7, reason: 'page', focus: null })
  })

  it('a page press never moves focus, even onto a bound', () => {
    expect(paginationPagePress(at(2), 1)?.focus).toBeNull()
    expect(paginationPagePress(at(2), 10)?.focus).toBeNull()
  })

  it('pressing the current page changes nothing', () => {
    expect(paginationPagePress(at(4), 4)).toBeNull()
  })

  it('clamps an out-of-range target', () => {
    expect(paginationPagePress(at(4), 99)?.page).toBe(10)
    expect(paginationPagePress(at(4), -2)?.page).toBe(1)
    expect(paginationPagePress(at(10), 99)).toBeNull()
  })

  it('steppers move by one and say which one', () => {
    expect(paginationStep(at(4), 'next')).toEqual({ page: 5, reason: 'next', focus: null })
    expect(paginationStep(at(4), 'prev')).toEqual({ page: 3, reason: 'prev', focus: null })
  })

  it('a stepper that lands on its bound hands focus to the current page', () => {
    expect(paginationStep(at(9), 'next')).toEqual({ page: 10, reason: 'next', focus: 'current' })
    expect(paginationStep(at(2), 'prev')).toEqual({ page: 1, reason: 'prev', focus: 'current' })
    expect(paginationStep(at(1, 2), 'next')?.focus).toBe('current')
  })

  it('a stepper leaving a bound keeps focus (it stays enabled)', () => {
    expect(paginationStep(at(10), 'prev')?.focus).toBeNull()
    expect(paginationStep(at(1), 'next')?.focus).toBeNull()
  })

  it('a stepper at its bound does nothing', () => {
    expect(paginationStep(at(1), 'prev')).toBeNull()
    expect(paginationStep(at(10), 'next')).toBeNull()
  })

  it('a disabled control ignores every press', () => {
    expect(paginationPagePress(at(4, 10, true), 7)).toBeNull()
    expect(paginationStep(at(4, 10, true), 'next')).toBeNull()
    expect(paginationStep(at(4, 10, true), 'prev')).toBeNull()
  })
})

describe('core/pagination — attributes', () => {
  it('disables a stepper at its bound, or when the control is disabled', () => {
    expect(paginationStepperDisabled(at(1), 'prev')).toBe(true)
    expect(paginationStepperDisabled(at(1), 'next')).toBe(false)
    expect(paginationStepperDisabled(at(10), 'next')).toBe(true)
    expect(paginationStepperDisabled(at(10), 'prev')).toBe(false)
    expect(paginationStepperDisabled(at(5, 10, true), 'prev')).toBe(true)
    expect(paginationStepperDisabled(at(5, 10, true), 'next')).toBe(true)
    expect(paginationStepperDisabled(at(1, 1), 'prev')).toBe(true)
    expect(paginationStepperDisabled(at(1, 1), 'next')).toBe(true)
  })

  it('marks the current page and names every page button', () => {
    expect(paginationPageAttrs(3, 3)).toEqual({ 'aria-current': 'page', 'aria-label': 'Page 3' })
    expect(paginationPageAttrs(4, 3)).toEqual({ 'aria-current': undefined, 'aria-label': 'Page 4' })
  })
})
