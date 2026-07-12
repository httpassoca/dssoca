import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import {
  shortcuts,
  shortcut,
  formatShortcut,
  ariaKeyshortcuts,
  type ShortcutOptions,
} from '$lib/shortcuts.svelte'
import ShortcutHarness from '../harness/ShortcutHarness.svelte'

// ---------------------------------------------------------------------------
// Helpers — the registry is a module singleton, so every test disposes what it
// registers and restores the global toggles/overrides.
// ---------------------------------------------------------------------------

const disposers: Array<() => void> = []
const cleanupEls: Element[] = []

let seq = 0
/** Register through the singleton, auto-tracking the disposer. */
function add(
  options: Partial<ShortcutOptions> & {
    onPress: ShortcutOptions['onPress']
    element?: Element
  },
) {
  const { element, ...rest } = options
  const opts: ShortcutOptions = {
    id: rest.id ?? `test:auto-${++seq}`,
    label: rest.label ?? 'Test action',
    keys: rest.keys ?? 'mod+k',
    ...rest,
  }
  const dispose = shortcuts.add(opts, element)
  disposers.push(dispose)
  return dispose
}

/** Attach an element to the document; removed automatically after the test. */
function attach<T extends Element>(el: T): T {
  document.body.appendChild(el)
  cleanupEls.push(el)
  return el
}

/** Dispatch a bubbling, cancelable keydown; returns the event for inspection. */
function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = window) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

function mockApple() {
  vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' })
}

afterEach(() => {
  for (const dispose of disposers.splice(0)) dispose()
  shortcuts.resetOverrides()
  for (const el of cleanupEls.splice(0)) el.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Parser — exercised through the public surface (add() / items / throws)
// ---------------------------------------------------------------------------

describe('shortcuts — combo parser', () => {
  it.each([
    ['mod+k', 'mod+k'],
    ['MOD+K', 'mod+k'],
    ['Shift+Ctrl+P', 'ctrl+shift+p'],
    ['meta+alt+ArrowUp', 'alt+meta+arrowup'],
    [' mod+k ', 'mod+k'],
    ['?', '?'],
    ['escape', 'escape'],
    ['mod++', 'mod++'],
    ['?, mod+/', '?, mod+/'],
    ['ctrl+/ ,alt+F1', 'ctrl+/, alt+f1'],
  ])('normalizes %j to canonical %j', (input, canonical) => {
    add({ keys: input, onPress: vi.fn() })
    expect(shortcuts.items.at(-1)?.keys).toBe(canonical)
    expect(shortcuts.items.at(-1)?.defaultKeys).toBe(canonical)
  })

  it.each([
    ['g i', /space is reserved/],
    ['mod+k j', /space is reserved/],
    ['k+j', /unknown modifier/],
    ['super+k', /unknown modifier/],
    ['ctrl+ctrl+k', /duplicate modifier/],
    ['ctrl+', /missing key/],
    ['', /non-empty/],
    ['mod+k,', /empty combo/],
  ])('throws at registration on malformed %j', (input, message) => {
    expect(() => shortcuts.add({ id: 'x', label: 'x', keys: input, onPress: vi.fn() })).toThrow(
      message,
    )
  })

  it("dev-warns on 'shift+/'-style spellings of shifted printables", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    add({ keys: 'shift+/', onPress: vi.fn() })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("'?'"))
  })

  it('dev-warns on reserved browser combos and bare SR quick keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    add({ id: 'test:reserved', keys: 'ctrl+t', onPress: vi.fn() })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('browser reserves'))
    warn.mockClear()
    add({ id: 'test:sr', keys: 'h', onPress: vi.fn() })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('browse mode'))
    warn.mockClear()
    add({ id: 'test:fine', keys: 'mod+k', onPress: vi.fn() })
    expect(warn).not.toHaveBeenCalled()
  })

  it('dev-warns on a duplicate id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    add({ id: 'test:dup', keys: 'mod+1', onPress: vi.fn() })
    expect(warn).not.toHaveBeenCalled()
    add({ id: 'test:dup', keys: 'mod+2', onPress: vi.fn() })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('duplicate id "test:dup"'))
  })
})

// ---------------------------------------------------------------------------
// Matcher — mod resolution, shift rule, alternatives, preventDefault
// ---------------------------------------------------------------------------

describe('shortcuts — matching', () => {
  it('mod+k fires on Ctrl+K (not Meta+K) on non-Apple platforms', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    press('k', { metaKey: true })
    expect(onPress).not.toHaveBeenCalled()
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('mod+k fires on Meta+K (not Ctrl+K) on Apple platforms', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    mockApple()
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    press('k', { metaKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('requires all bound modifiers and no extras', () => {
    const onPress = vi.fn()
    add({ keys: 'ctrl+shift+p', onPress })
    press('p', { ctrlKey: true })
    press('p', { ctrlKey: true, shiftKey: true, altKey: true })
    expect(onPress).not.toHaveBeenCalled()
    press('p', { ctrlKey: true, shiftKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('matches event.key case-insensitively (Shift+K produces "K")', () => {
    const onPress = vi.fn()
    add({ keys: 'shift+k', onPress })
    press('K', { shiftKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it("shifted printables match as typed: '?' fires regardless of shiftKey", () => {
    const onPress = vi.fn()
    add({ keys: '?', onPress })
    press('?', { shiftKey: true })
    press('?', { shiftKey: false })
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it('a bare letter does NOT fire when shift is held (that is shift+letter)', () => {
    const onPress = vi.fn()
    add({ keys: 'j', onPress })
    press('J', { shiftKey: true })
    expect(onPress).not.toHaveBeenCalled()
    press('j')
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('comma alternatives all trigger the same handler', () => {
    const onPress = vi.fn()
    add({ keys: '?, mod+/', onPress })
    press('?', { shiftKey: true })
    press('/', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it('calls preventDefault by default and passes the event to onPress', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    const event = press('k', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(true)
    expect(onPress).toHaveBeenCalledWith(event)
  })

  it('preventDefault: false leaves the event unprevented', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', preventDefault: false, onPress })
    const event = press('k', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Skip chain
// ---------------------------------------------------------------------------

describe('shortcuts — skip chain', () => {
  it('shortcuts.enabled = false silences everything (global kill switch)', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    shortcuts.enabled = false
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    shortcuts.enabled = true
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('skips events a component already handled (defaultPrevented)', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })
    event.preventDefault()
    window.dispatchEvent(event)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('skips IME composition events', () => {
    const onPress = vi.fn()
    add({ keys: 'j', onPress })
    press('j', { isComposing: true })
    expect(onPress).not.toHaveBeenCalled()
  })

  it('skips key-repeat events unless allowRepeat', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    press('k', { ctrlKey: true, repeat: true })
    expect(onPress).not.toHaveBeenCalled()

    const repeating = vi.fn()
    add({ keys: 'mod+j', allowRepeat: true, onPress: repeating })
    press('j', { ctrlKey: true, repeat: true })
    expect(repeating).toHaveBeenCalledTimes(1)
  })

  it('characterKeys = false kills modifier-less bindings but not mod+ combos (2.1.4)', () => {
    const slash = vi.fn()
    const modK = vi.fn()
    add({ keys: '/', onPress: slash })
    add({ keys: 'mod+k', onPress: modK })
    shortcuts.characterKeys = false
    press('/')
    press('k', { ctrlKey: true })
    expect(slash).not.toHaveBeenCalled()
    expect(modK).toHaveBeenCalledTimes(1)
    shortcuts.characterKeys = true
    press('/')
    expect(slash).toHaveBeenCalledTimes(1)
  })

  it("also kills '?'-style shifted printables while characterKeys = false", () => {
    const onPress = vi.fn()
    add({ keys: '?', onPress })
    shortcuts.characterKeys = false
    press('?', { shiftKey: true })
    expect(onPress).not.toHaveBeenCalled()
  })

  it('skips events from inputs / textareas / selects unless allowInInputs', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    for (const tag of ['input', 'textarea', 'select'] as const) {
      press('k', { ctrlKey: true }, attach(document.createElement(tag)))
    }
    expect(onPress).not.toHaveBeenCalled()

    const allowed = vi.fn()
    add({ keys: 'mod+j', allowInInputs: true, onPress: allowed })
    press('j', { ctrlKey: true }, attach(document.createElement('input')))
    expect(allowed).toHaveBeenCalledTimes(1)
  })

  it('treats descendants of [contenteditable] as inputs (ancestor check)', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    const editable = attach(document.createElement('div'))
    editable.setAttribute('contenteditable', '')
    const child = document.createElement('span')
    editable.appendChild(child)
    press('k', { ctrlKey: true }, child)
    expect(onPress).not.toHaveBeenCalled()

    // contenteditable="false" is NOT editable — the shortcut fires.
    editable.setAttribute('contenteditable', 'false')
    press('k', { ctrlKey: true }, child)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('respects a registration-level enabled function reactively', () => {
    let available = false
    const onPress = vi.fn()
    add({ keys: 'mod+k', enabled: () => available, onPress })
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    available = true
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Modal <dialog> suppression (SC 2.1.2)
// ---------------------------------------------------------------------------

describe('shortcuts — modal dialog suppression', () => {
  function openDialog(): HTMLDialogElement {
    const dialog = attach(document.createElement('dialog'))
    dialog.setAttribute('open', '')
    return dialog
  }

  it('suppresses global shortcuts while a modal dialog is open', () => {
    const onPress = vi.fn()
    add({ keys: 'mod+k', onPress })
    const dialog = openDialog()
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    dialog.remove()
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('focus-scoped shortcuts anchored inside the dialog still fire', () => {
    const dialog = openDialog()
    const button = document.createElement('button')
    dialog.appendChild(button)
    const inside = vi.fn()
    const outside = vi.fn()
    add({ keys: 'mod+k', scope: 'focus', element: dialog, onPress: inside })
    add({ keys: 'mod+k', onPress: outside })
    press('k', { ctrlKey: true }, button)
    expect(inside).toHaveBeenCalledTimes(1)
    expect(outside).not.toHaveBeenCalled()
  })

  it('focus-scoped shortcuts anchored OUTSIDE the dialog are suppressed too', () => {
    const section = attach(document.createElement('section'))
    const button = document.createElement('button')
    section.appendChild(button)
    const onPress = vi.fn()
    add({ keys: 'mod+k', scope: 'focus', element: section, onPress })
    openDialog()
    press('k', { ctrlKey: true }, button)
    expect(onPress).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Conflict tiers — exactly one fires
// ---------------------------------------------------------------------------

describe('shortcuts — conflicts', () => {
  it('last-registered wins within the global tier (exactly one fires)', () => {
    const first = vi.fn()
    const second = vi.fn()
    add({ keys: 'mod+k', onPress: first })
    add({ keys: 'mod+k', onPress: second })
    press('k', { ctrlKey: true })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('a disabled later registration yields to an earlier eligible one', () => {
    const first = vi.fn()
    const second = vi.fn()
    add({ keys: 'mod+k', onPress: first })
    add({ keys: 'mod+k', enabled: false, onPress: second })
    press('k', { ctrlKey: true })
    expect(second).not.toHaveBeenCalled()
    expect(first).toHaveBeenCalledTimes(1)
  })

  it('a focus-scoped shortcut beats a later-registered global one', () => {
    const section = attach(document.createElement('section'))
    const button = document.createElement('button')
    section.appendChild(button)
    const focused = vi.fn()
    const global = vi.fn()
    add({ keys: 'mod+k', scope: 'focus', element: section, onPress: focused })
    add({ keys: 'mod+k', onPress: global })
    press('k', { ctrlKey: true }, button)
    expect(focused).toHaveBeenCalledTimes(1)
    expect(global).not.toHaveBeenCalled()
    // Outside the element the global one fires instead.
    press('k', { ctrlKey: true })
    expect(global).toHaveBeenCalledTimes(1)
    expect(focused).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// 2.1.4 mechanics — setEnabled / remap / overrides round-trip
// ---------------------------------------------------------------------------

describe('shortcuts — 2.1.4 mechanics', () => {
  it('setEnabled(id, false) silences; setEnabled(id, true) restores', () => {
    const onPress = vi.fn()
    add({ id: 'test:toggle', keys: 'mod+k', onPress })
    shortcuts.setEnabled('test:toggle', false)
    expect(shortcuts.items.find((s) => s.id === 'test:toggle')?.enabled).toBe(false)
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    shortcuts.setEnabled('test:toggle', true)
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('remap fires on the new combo only; remap(id, null) restores the default', () => {
    const onPress = vi.fn()
    add({ id: 'test:remap', keys: 'mod+k', onPress })
    shortcuts.remap('test:remap', 'mod+j')
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    press('j', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
    const info = shortcuts.items.find((s) => s.id === 'test:remap')
    expect(info?.keys).toBe('mod+j')
    expect(info?.defaultKeys).toBe('mod+k')

    shortcuts.remap('test:remap', null)
    press('j', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(2)
    expect(shortcuts.items.find((s) => s.id === 'test:remap')?.keys).toBe('mod+k')
  })

  it('remap throws on malformed keys', () => {
    expect(() => shortcuts.remap('test:x', 'g i')).toThrow(/space is reserved/)
  })

  it('getOverrides → applyOverrides round-trips, including the global toggles', () => {
    const onPress = vi.fn()
    add({ id: 'test:rt', keys: 'mod+k', onPress })
    shortcuts.characterKeys = false
    shortcuts.setEnabled('test:rt', false)
    shortcuts.remap('test:rt', 'mod+j')

    const saved = shortcuts.getOverrides()
    // Serializable: survives a JSON round-trip intact.
    expect(JSON.parse(JSON.stringify(saved))).toEqual(saved)
    expect(saved).toMatchObject({
      enabled: true,
      characterKeys: false,
      shortcuts: { 'test:rt': { enabled: false, keys: 'mod+j' } },
    })

    shortcuts.resetOverrides()
    expect(shortcuts.characterKeys).toBe(true)
    expect(shortcuts.items.find((s) => s.id === 'test:rt')).toMatchObject({
      keys: 'mod+k',
      enabled: true,
    })

    shortcuts.applyOverrides(JSON.parse(JSON.stringify(saved)))
    expect(shortcuts.characterKeys).toBe(false)
    expect(shortcuts.items.find((s) => s.id === 'test:rt')).toMatchObject({
      keys: 'mod+j',
      enabled: false,
    })
    press('j', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled() // still user-disabled
  })

  it('overrides applied before registration take effect when the shortcut mounts', () => {
    shortcuts.applyOverrides({ shortcuts: { 'test:pre': { keys: 'mod+j' } } })
    const onPress = vi.fn()
    add({ id: 'test:pre', keys: 'mod+k', onPress })
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    press('j', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(shortcuts.items.find((s) => s.id === 'test:pre')?.keys).toBe('mod+j')
  })

  it('applyOverrides skips malformed persisted combos with a dev warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onPress = vi.fn()
    add({ id: 'test:bad', keys: 'mod+k', onPress })
    expect(() =>
      shortcuts.applyOverrides({ shortcuts: { 'test:bad': { keys: 'not a combo' } } }),
    ).not.toThrow()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('invalid persisted combo'))
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1) // default still active
  })

  it('a user override cannot force-enable a contextually disabled shortcut', () => {
    const onPress = vi.fn()
    add({ id: 'test:ctx', keys: 'mod+k', enabled: () => false, onPress })
    shortcuts.setEnabled('test:ctx', true)
    expect(shortcuts.items.find((s) => s.id === 'test:ctx')?.enabled).toBe(false)
    press('k', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Listener lifecycle + SSR posture
// ---------------------------------------------------------------------------

describe('shortcuts — listener lifecycle', () => {
  const keydownCalls = (spy: { mock: { calls: unknown[][] } }) =>
    spy.mock.calls.filter(([type]) => type === 'keydown').length

  it('one lazy window listener serves N shortcuts; detaches at zero', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const d1 = add({ keys: 'mod+1', onPress: vi.fn() })
    const d2 = add({ keys: 'mod+2', onPress: vi.fn() })
    const d3 = add({ keys: 'mod+3', onPress: vi.fn() })
    expect(keydownCalls(addSpy)).toBe(1)

    d1()
    d2()
    expect(keydownCalls(removeSpy)).toBe(0)
    d3()
    expect(keydownCalls(removeSpy)).toBe(1)

    // Re-adding re-attaches (lazy again).
    add({ keys: 'mod+4', onPress: vi.fn() })
    expect(keydownCalls(addSpy)).toBe(2)
  })

  it('disposers are idempotent', () => {
    const onPress = vi.fn()
    const keep = add({ keys: 'mod+9', onPress })
    const d = add({ keys: 'mod+8', onPress: vi.fn() })
    d()
    d()
    d()
    expect(shortcuts.items).toHaveLength(1)
    press('9', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
    keep()
  })

  it('SSR: add() without window registers nothing and returns a working noop disposer', () => {
    vi.stubGlobal('window', undefined)
    const dispose = shortcuts.add({ id: 'ssr:x', label: 'x', keys: 'mod+k', onPress: vi.fn() })
    expect(shortcuts.items).toHaveLength(0)
    expect(() => dispose()).not.toThrow()
    expect(() => dispose()).not.toThrow()
  })

  it('SSR: add() still validates the combo grammar', () => {
    vi.stubGlobal('window', undefined)
    expect(() => shortcuts.add({ id: 'ssr:y', label: 'y', keys: 'g i', onPress: vi.fn() })).toThrow(
      /space is reserved/,
    )
  })
})

// ---------------------------------------------------------------------------
// items — reactive registry view
// ---------------------------------------------------------------------------

describe('shortcuts — items', () => {
  it('exposes id/label/group/scope/keys/defaultKeys/enabled in registration order', () => {
    add({ id: 'test:a', label: 'Alpha', group: 'Nav', keys: 'mod+1', onPress: vi.fn() })
    add({ id: 'test:b', label: 'Beta', keys: 'mod+2', enabled: false, onPress: vi.fn() })
    expect(shortcuts.items).toEqual([
      {
        id: 'test:a',
        label: 'Alpha',
        group: 'Nav',
        scope: 'global',
        keys: 'mod+1',
        defaultKeys: 'mod+1',
        enabled: true,
      },
      {
        id: 'test:b',
        label: 'Beta',
        group: undefined,
        scope: 'global',
        keys: 'mod+2',
        defaultKeys: 'mod+2',
        enabled: false,
      },
    ])
  })

  it('shrinks when a registration is disposed', () => {
    const d = add({ id: 'test:gone', keys: 'mod+1', onPress: vi.fn() })
    expect(shortcuts.items).toHaveLength(1)
    d()
    expect(shortcuts.items).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// shortcut() attachment
// ---------------------------------------------------------------------------

describe('shortcut() attachment', () => {
  it('registers on mount and cleans up on unmount', () => {
    const onPress = vi.fn()
    const { unmount } = render(ShortcutHarness, { id: 'test:attach', onPress })
    expect(shortcuts.items.find((s) => s.id === 'test:attach')).toBeTruthy()
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
    unmount()
    expect(shortcuts.items.find((s) => s.id === 'test:attach')).toBeUndefined()
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('re-registers reactively when the options thunk changes', async () => {
    const onPress = vi.fn()
    const { rerender } = render(ShortcutHarness, { id: 'test:reactive', keys: 'mod+k', onPress })
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)

    await rerender({ keys: 'mod+j' })
    expect(shortcuts.items.filter((s) => s.id === 'test:reactive')).toHaveLength(1)
    expect(shortcuts.items.find((s) => s.id === 'test:reactive')?.keys).toBe('mod+j')
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1) // old combo dead
    press('j', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it("scope: 'focus' only fires while the event target is inside the element", () => {
    const onPress = vi.fn()
    const { getByTestId } = render(ShortcutHarness, {
      id: 'test:focus',
      scope: 'focus',
      onPress,
    })
    press('k', { ctrlKey: true }, getByTestId('outside'))
    press('k', { ctrlKey: true }) // window target
    expect(onPress).not.toHaveBeenCalled()
    press('k', { ctrlKey: true }, getByTestId('inside'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('accepts a plain options object too', () => {
    const onPress = vi.fn()
    const el = attach(document.createElement('div'))
    const attachment = shortcut({ id: 'test:plain', label: 'Plain', keys: 'mod+k', onPress })
    const cleanup = attachment(el) as () => void
    press('k', { ctrlKey: true })
    expect(onPress).toHaveBeenCalledTimes(1)
    cleanup()
    expect(shortcuts.items.find((s) => s.id === 'test:plain')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Pure formatters
// ---------------------------------------------------------------------------

describe('formatShortcut', () => {
  it.each([
    ['mod+k', 'glyph', 'apple', '⌘K'],
    ['mod+k', 'glyph', 'other', 'Ctrl+K'],
    ['mod+k', 'label', 'apple', 'Command+K'],
    ['mod+k', 'label', 'other', 'Ctrl+K'],
    ['ctrl+shift+p', 'glyph', 'apple', '⌃⇧P'],
    ['ctrl+shift+p', 'label', 'other', 'Ctrl+Shift+P'],
    ['alt+arrowup', 'glyph', 'apple', '⌥↑'],
    ['alt+arrowup', 'label', 'other', 'Alt+Up Arrow'],
    ['escape', 'glyph', 'other', 'Esc'],
    ['escape', 'label', 'apple', 'Escape'],
    ['f1', 'glyph', 'other', 'F1'],
    ['?', 'glyph', 'apple', '?'],
    ['?, mod+/', 'glyph', 'apple', '? / ⌘/'],
    ['?, mod+/', 'label', 'other', '? / Ctrl+/'],
    ['meta+k', 'glyph', 'other', 'Meta+K'],
  ] as const)('formats %j as %s/%s → %j', (keys, format, platform, expected) => {
    expect(formatShortcut(keys, { format, platform })).toBe(expected)
  })

  it('defaults to glyph format on the detected platform', () => {
    // jsdom is not mac-like → 'other'
    expect(formatShortcut('mod+k')).toBe('Ctrl+K')
    mockApple()
    expect(formatShortcut('mod+k')).toBe('⌘K')
  })

  it('throws on malformed input (same grammar as registration)', () => {
    expect(() => formatShortcut('g i')).toThrow(/space is reserved/)
  })
})

describe('ariaKeyshortcuts', () => {
  it.each([
    ['mod+k', 'apple', 'Meta+K'],
    ['mod+k', 'other', 'Control+K'],
    ['ctrl+alt+shift+arrowup', 'other', 'Control+Alt+Shift+ArrowUp'],
    ['meta+escape', 'other', 'Meta+Escape'],
    ['?, mod+/', 'other', '? Control+/'],
    ['f1', 'other', 'F1'],
    ['mod++', 'apple', 'Meta+Plus'],
  ] as const)('%j on %s → %j', (keys, platform, expected) => {
    expect(ariaKeyshortcuts(keys, platform)).toBe(expected)
  })

  it('defaults to the detected platform', () => {
    expect(ariaKeyshortcuts('mod+k')).toBe('Control+K')
    mockApple()
    expect(ariaKeyshortcuts('mod+k')).toBe('Meta+K')
  })

  it('throws on malformed input', () => {
    expect(() => ariaKeyshortcuts('k+j')).toThrow(/unknown modifier/)
  })
})
