import { describe, it, expect } from 'vitest'
import {
  SWIPE_THRESHOLD,
  toastActionDismisses,
  toastFocusAfterDismiss,
  toastKey,
  toastPressStartsSwipe,
  toastShouldResume,
  toastSwipeDismisses,
} from '$lib/core/toast'

// DS-0197 — the toast decisions shared by Toaster.svelte and vanilla/toast.ts. The timer and
// the per-kind defaults are pinned through the two stores (toast.svelte.test, vanilla-toast.test).

describe('core/toast — toastKey', () => {
  it('Escape dismisses the toast and stops there', () => {
    expect(toastKey('Escape')).toEqual({ action: { type: 'dismiss' }, stopPropagation: true })
  })

  it('lets every other key through', () => {
    for (const key of ['Enter', ' ', 'Tab', 'Delete', 'Backspace', 'ArrowRight', 'a']) {
      expect(toastKey(key)).toBeNull()
    }
  })
})

describe('core/toast — toastShouldResume', () => {
  it('runs the timer again only when nothing holds the toast', () => {
    expect(toastShouldResume({ hovered: false, focused: false })).toBe(true)
    expect(toastShouldResume({ hovered: false, focused: false, dragging: false })).toBe(true)
  })

  it('hover, focus and a swipe each hold it on their own', () => {
    expect(toastShouldResume({ hovered: true, focused: false })).toBe(false)
    expect(toastShouldResume({ hovered: false, focused: true })).toBe(false)
    expect(toastShouldResume({ hovered: false, focused: false, dragging: true })).toBe(false)
    expect(toastShouldResume({ hovered: true, focused: true, dragging: true })).toBe(false)
  })
})

describe('core/toast — toastActionDismisses', () => {
  it('dismisses unless the handler returned false', () => {
    expect(toastActionDismisses(undefined)).toBe(true)
    expect(toastActionDismisses(false)).toBe(false)
  })
})

describe('core/toast — toastFocusAfterDismiss', () => {
  it('prefers the next toast in the stack', () => {
    expect(toastFocusAfterDismiss([1, 2, 3], 2)).toBe(3)
    expect(toastFocusAfterDismiss([1, 2, 3], 1)).toBe(2)
  })

  it('falls back to the nearest toast before it', () => {
    expect(toastFocusAfterDismiss([1, 2, 3], 3)).toBe(2)
  })

  it('skips toasts that cannot take focus', () => {
    const not =
      (...gone: number[]) =>
      (id: number) =>
        !gone.includes(id)
    expect(toastFocusAfterDismiss([1, 2, 3, 4], 2, not(3))).toBe(4)
    expect(toastFocusAfterDismiss([1, 2, 3, 4], 3, not(4))).toBe(2)
    expect(toastFocusAfterDismiss([1, 2, 3, 4], 3, not(4, 2))).toBe(1)
    // The dismissed toast itself is never a candidate, whatever the filter says.
    expect(toastFocusAfterDismiss([1, 2], 1, not(2))).toBeNull()
  })

  it('returns null when no toast is left, so focus goes back to where it came from', () => {
    expect(toastFocusAfterDismiss([7], 7)).toBeNull()
    expect(toastFocusAfterDismiss([1, 2, 3], 2, () => false)).toBeNull()
  })

  it('returns null for a toast that is not in the stack', () => {
    expect(toastFocusAfterDismiss([1, 2], 9)).toBeNull()
    expect(toastFocusAfterDismiss([], 1)).toBeNull()
  })
})

describe('core/toast — swipe', () => {
  const press = { button: 0, onControl: false, reducedMotion: false }

  it('a primary press on the toast body starts a swipe', () => {
    expect(toastPressStartsSwipe(press)).toBe(true)
  })

  it('not from a button, another mouse button, or under reduced motion', () => {
    expect(toastPressStartsSwipe({ ...press, onControl: true })).toBe(false)
    expect(toastPressStartsSwipe({ ...press, button: 2 })).toBe(false)
    expect(toastPressStartsSwipe({ ...press, reducedMotion: true })).toBe(false)
  })

  it('dismisses once released past the threshold, in either direction', () => {
    expect(SWIPE_THRESHOLD).toBe(64)
    expect(toastSwipeDismisses(0)).toBe(false)
    expect(toastSwipeDismisses(63)).toBe(false)
    expect(toastSwipeDismisses(-63)).toBe(false)
    expect(toastSwipeDismisses(64)).toBe(true)
    expect(toastSwipeDismisses(-64)).toBe(true)
    expect(toastSwipeDismisses(200)).toBe(true)
  })
})
