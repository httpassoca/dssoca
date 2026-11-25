import { describe, it, expect } from 'vitest'
import {
  menuClose,
  menuItemAttrs,
  menuItemPress,
  menuOpen,
  menuOutsidePress,
  menuPanelAttrs,
  menuPanelKey,
  menuTriggerAttrs,
  menuTriggerKey,
  menuTriggerPress,
  type MenuState,
} from '$lib/core/menu'

// Four items, index 1 disabled.
const closed: MenuState = { open: false, active: -1, enabled: [0, 2, 3] }
const opened = (active = 0): MenuState => ({ ...closed, open: true, active })

describe('core/menu — trigger', () => {
  it('a press opens on the first enabled item, and closes returning focus', () => {
    expect(menuTriggerPress(closed)).toEqual({ type: 'open', focus: 0, reason: 'trigger' })
    expect(menuTriggerPress(opened())).toEqual({
      type: 'close',
      returnFocus: true,
      reason: 'trigger',
    })
  })

  it.each(['ArrowDown', 'Enter', ' '])('%j opens on the first item', (key) => {
    expect(menuTriggerKey(closed, key)).toEqual({
      action: { type: 'open', focus: 0, reason: 'key' },
      preventDefault: true,
    })
  })

  it('ArrowUp opens on the last item', () => {
    expect(menuTriggerKey(closed, 'ArrowUp')?.action).toEqual({
      type: 'open',
      focus: 3,
      reason: 'key',
    })
  })

  it('an open key on an open menu does nothing but still cancels the default', () => {
    expect(menuTriggerKey(opened(), 'Enter')).toEqual({ action: null, preventDefault: true })
  })

  it('lets every other key through', () => {
    expect(menuTriggerKey(closed, 'a')).toBeNull()
    expect(menuTriggerKey(closed, 'Tab')).toBeNull()
  })
})

describe('core/menu — panel keys', () => {
  it('arrows move focus, skipping disabled items and wrapping', () => {
    expect(menuPanelKey(opened(0), 'ArrowDown')?.action).toEqual({ type: 'focus', index: 2 })
    expect(menuPanelKey(opened(3), 'ArrowDown')?.action).toEqual({ type: 'focus', index: 0 })
    expect(menuPanelKey(opened(2), 'ArrowUp')?.action).toEqual({ type: 'focus', index: 0 })
    expect(menuPanelKey(opened(0), 'ArrowUp')?.action).toEqual({ type: 'focus', index: 3 })
  })

  it('Home / End jump to the ends', () => {
    expect(menuPanelKey(opened(2), 'Home')?.action).toEqual({ type: 'focus', index: 0 })
    expect(menuPanelKey(opened(0), 'End')?.action).toEqual({ type: 'focus', index: 3 })
  })

  it('Escape closes and returns focus', () => {
    expect(menuPanelKey(opened(), 'Escape')).toEqual({
      action: { type: 'close', returnFocus: true, reason: 'escape' },
      preventDefault: true,
    })
  })

  it('Tab closes without returning focus and without cancelling the default', () => {
    expect(menuPanelKey(opened(), 'Tab')).toEqual({
      action: { type: 'close', returnFocus: false, reason: 'tab' },
      preventDefault: false,
    })
  })

  it('lets every other key through', () => {
    expect(menuPanelKey(opened(), 'a')).toBeNull()
  })
})

describe('core/menu — dismissal, items and imperative calls', () => {
  it('an outside press closes an open menu without returning focus', () => {
    expect(menuOutsidePress(opened())).toEqual({
      type: 'close',
      returnFocus: false,
      reason: 'outside',
    })
    expect(menuOutsidePress(closed)).toBeNull()
  })

  it('an enabled item selects and closes; a disabled one does nothing', () => {
    expect(menuItemPress(opened(), 2)).toEqual({
      action: { type: 'close', returnFocus: true, reason: 'item' },
    })
    expect(menuItemPress(opened(), 1)).toBeNull()
  })

  it('menuOpen / menuClose are no-ops when already in that state', () => {
    expect(menuOpen(closed, 'last')).toEqual({ type: 'open', focus: 3, reason: 'trigger' })
    expect(menuOpen(opened())).toBeNull()
    expect(menuClose(opened(), false)).toEqual({
      type: 'close',
      returnFocus: false,
      reason: 'trigger',
    })
    expect(menuClose(closed)).toBeNull()
  })

  it('opening a menu with no enabled items focuses nothing', () => {
    expect(menuOpen({ open: false, active: -1, enabled: [] })).toEqual({
      type: 'open',
      focus: -1,
      reason: 'trigger',
    })
  })
})

describe('core/menu — attributes', () => {
  it('trigger and panel reflect the open state as strings', () => {
    expect(menuTriggerAttrs(true)).toEqual({ 'aria-haspopup': 'menu', 'aria-expanded': 'true' })
    expect(menuTriggerAttrs(false)['aria-expanded']).toBe('false')
    expect(menuPanelAttrs(true)).toEqual({ role: 'menu', 'aria-hidden': 'false', tabindex: -1 })
    expect(menuPanelAttrs(false)['aria-hidden']).toBe('true')
  })

  it('action rows are menuitem; selection groups are menuitemradio with aria-checked', () => {
    const base = { index: 0, active: 0 }
    expect(menuItemAttrs({ ...base, selectable: false })).toEqual({
      role: 'menuitem',
      'aria-checked': undefined,
      'aria-disabled': undefined,
      tabindex: 0,
    })
    expect(menuItemAttrs({ ...base, selectable: true, selected: true })['aria-checked']).toBe(
      'true',
    )
    expect(menuItemAttrs({ ...base, selectable: true })['aria-checked']).toBe('false')
  })

  it('disabled rows carry aria-disabled; only the active row is a tab stop', () => {
    const row = menuItemAttrs({ index: 1, active: 0, selectable: false, disabled: true })
    expect(row['aria-disabled']).toBe('true')
    expect(row.tabindex).toBe(-1)
  })
})
