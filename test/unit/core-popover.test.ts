import { describe, it, expect } from 'vitest'
import {
  popoverClose,
  popoverFocusOut,
  popoverKey,
  popoverOpen,
  popoverOutsidePress,
  popoverPanelAttrs,
  popoverTriggerAttrs,
  popoverTriggerPress,
} from '$lib/core/popover'
import { FOCUSABLE_SELECTOR } from '$lib/core/behaviors/focusable'

const OPEN = { open: true }
const CLOSED = { open: false }

describe('core/popover — trigger', () => {
  it('a press toggles, and closing hands focus back to the trigger', () => {
    expect(popoverTriggerPress(CLOSED)).toEqual({ type: 'open', reason: 'trigger' })
    expect(popoverTriggerPress(OPEN)).toEqual({
      type: 'close',
      returnFocus: true,
      reason: 'trigger',
    })
  })

  it('open / close from code are no-ops when already in that state', () => {
    expect(popoverOpen(CLOSED)).toEqual({ type: 'open', reason: 'trigger' })
    expect(popoverOpen(OPEN)).toBeNull()
    expect(popoverClose(OPEN)).toEqual({ type: 'close', returnFocus: true, reason: 'trigger' })
    expect(popoverClose(OPEN, false)).toMatchObject({ returnFocus: false })
    expect(popoverClose(CLOSED)).toBeNull()
  })
})

describe('core/popover — dismissal', () => {
  it('Escape closes, returns focus and cancels the default', () => {
    expect(popoverKey(OPEN, 'Escape')).toEqual({
      action: { type: 'close', returnFocus: true, reason: 'escape' },
      preventDefault: true,
    })
  })

  it('lets Escape through when closed, and every other key always', () => {
    expect(popoverKey(CLOSED, 'Escape')).toBeNull()
    for (const k of ['Tab', 'Enter', ' ', 'ArrowDown', 'a']) {
      expect(popoverKey(OPEN, k), k).toBeNull()
    }
  })

  it('an outside press closes without pulling focus back', () => {
    expect(popoverOutsidePress(OPEN)).toEqual({
      type: 'close',
      returnFocus: false,
      reason: 'outside',
    })
    expect(popoverOutsidePress(CLOSED)).toBeNull()
  })

  it('focus leaving to an outside element closes as a tab-out; anything else keeps it open', () => {
    expect(popoverFocusOut(OPEN, 'outside')).toEqual({
      type: 'close',
      returnFocus: false,
      reason: 'tab',
    })
    expect(popoverFocusOut(OPEN, 'inside')).toBeNull()
    expect(popoverFocusOut(OPEN, 'nowhere')).toBeNull()
    expect(popoverFocusOut(CLOSED, 'outside')).toBeNull()
  })
})

describe('core/popover — attributes', () => {
  it('the trigger announces a dialog popup and its state', () => {
    expect(popoverTriggerAttrs(false)).toEqual({
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
    })
    expect(popoverTriggerAttrs(true)['aria-expanded']).toBe('true')
  })

  it('the panel is a non-modal dialog, focusable from code only', () => {
    expect(popoverPanelAttrs()).toEqual({ role: 'dialog', tabindex: -1 })
  })
})

describe('core/behaviors/focusable', () => {
  it('matches the usual focusable elements and skips disabled / tabindex=-1 ones', () => {
    const host = document.createElement('div')
    host.innerHTML = `
      <a>no href</a><a href="/x" id="a"></a>
      <button disabled></button><button id="b"></button>
      <input type="hidden"><input id="i"><input disabled>
      <select id="s"></select><textarea id="t"></textarea>
      <div tabindex="-1"></div><div tabindex="0" id="d"></div>`
    const ids = Array.from(host.querySelectorAll(FOCUSABLE_SELECTOR)).map((e) => e.id)
    expect(ids).toEqual(['a', 'b', 'i', 's', 't', 'd'])
  })
})
