import { describe, it, expect } from 'vitest'
import {
  imageAspect,
  imageCanOpen,
  imageDialogAttrs,
  imageDialogKey,
  imageFrameAttrs,
  imageLoadResult,
  imageTriggerAttrs,
  type ImageDialogKeyInput,
} from '$lib/core/image'

describe('core/image — load state', () => {
  it('maps the img events to a load state', () => {
    expect(imageLoadResult('load')).toBe('loaded')
    expect(imageLoadResult('error')).toBe('error')
  })

  it('reflects loading as a string aria-busy', () => {
    expect(imageFrameAttrs('loading')).toEqual({ 'aria-busy': 'true' })
    expect(imageFrameAttrs('loaded')).toEqual({ 'aria-busy': 'false' })
    expect(imageFrameAttrs('error')).toEqual({ 'aria-busy': 'false' })
  })
})

describe('core/image — aspect ratio', () => {
  it('prefers an explicit positive ratio', () => {
    expect(imageAspect({ ratio: 2, width: 100, height: 100 })).toBe(2)
  })

  it('derives the ratio from width / height', () => {
    expect(imageAspect({ width: 1600, height: 900 })).toBeCloseTo(16 / 9)
    expect(imageAspect({ ratio: 0, width: 400, height: 200 })).toBe(2)
    expect(imageAspect({ ratio: -1, width: 400, height: 200 })).toBe(2)
  })

  it('reserves nothing without enough information', () => {
    expect(imageAspect({})).toBeNull()
    expect(imageAspect({ width: 400 })).toBeNull()
    expect(imageAspect({ height: 400 })).toBeNull()
    expect(imageAspect({ width: 400, height: 0 })).toBeNull()
  })
})

describe('core/image — lightbox', () => {
  it('can open only when enabled and the image did not fail', () => {
    expect(imageCanOpen(true, 'loading')).toBe(true)
    expect(imageCanOpen(true, 'loaded')).toBe(true)
    expect(imageCanOpen(true, 'error')).toBe(false)
    expect(imageCanOpen(false, 'loaded')).toBe(false)
  })

  it('names the trigger and the dialog from the alt text', () => {
    expect(imageTriggerAttrs('A cat')).toEqual({
      'aria-haspopup': 'dialog',
      'aria-label': 'View image: A cat',
    })
    expect(imageTriggerAttrs('')['aria-label']).toBe('View image full size')
    expect(imageDialogAttrs('A cat')).toEqual({
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Image: A cat',
      tabindex: -1,
    })
    expect(imageDialogAttrs('')['aria-label']).toBe('Image preview')
  })
})

describe('core/image — keys inside the lightbox', () => {
  const key = (over: Partial<ImageDialogKeyInput>): ImageDialogKeyInput => ({
    key: 'Tab',
    shiftKey: false,
    focusableCount: 3,
    activeIndex: 1,
    ...over,
  })

  it('Escape closes, cancels the default and stops the key', () => {
    expect(imageDialogKey(key({ key: 'Escape' }))).toEqual({
      action: { type: 'close' },
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('Escape closes even with nothing focusable', () => {
    expect(
      imageDialogKey(key({ key: 'Escape', focusableCount: 0, activeIndex: -1 }))?.action,
    ).toEqual({ type: 'close' })
  })

  it('Tab on the last focusable wraps to the first', () => {
    expect(imageDialogKey(key({ activeIndex: 2 }))).toEqual({
      action: { type: 'focus', index: 0 },
      preventDefault: true,
      stopPropagation: false,
    })
  })

  it('Shift+Tab on the first focusable wraps to the last', () => {
    expect(imageDialogKey(key({ shiftKey: true, activeIndex: 0 }))).toEqual({
      action: { type: 'focus', index: 2 },
      preventDefault: true,
      stopPropagation: false,
    })
  })

  it('a single focusable wraps onto itself both ways', () => {
    expect(imageDialogKey(key({ focusableCount: 1, activeIndex: 0 }))?.action).toEqual({
      type: 'focus',
      index: 0,
    })
    expect(
      imageDialogKey(key({ focusableCount: 1, activeIndex: 0, shiftKey: true }))?.action,
    ).toEqual({ type: 'focus', index: 0 })
  })

  it('lets a Tab that stays inside through', () => {
    expect(imageDialogKey(key({ activeIndex: 1 }))).toBeNull()
    expect(imageDialogKey(key({ activeIndex: 0 }))).toBeNull()
    expect(imageDialogKey(key({ activeIndex: 2, shiftKey: true }))).toBeNull()
  })

  it('lets Tab through when focus is not on a focusable, or there is none', () => {
    expect(imageDialogKey(key({ activeIndex: -1 }))).toBeNull()
    expect(imageDialogKey(key({ activeIndex: -1, shiftKey: true }))).toBeNull()
    expect(imageDialogKey(key({ focusableCount: 0, activeIndex: -1 }))).toBeNull()
  })

  it('ignores every other key', () => {
    for (const k of ['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'a']) {
      expect(imageDialogKey(key({ key: k }))).toBeNull()
    }
  })
})
