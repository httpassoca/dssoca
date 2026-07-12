import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import { axe } from 'vitest-axe'
import { shortcuts, type ShortcutOptions } from '$lib/shortcuts.svelte'
import ShortcutsHelpHarness from '../harness/ShortcutsHelpHarness.svelte'

// DS-0138 — ShortcutsHelp, the "?" discovery overlay. Dialog mechanics
// (focus trap, Esc, backdrop, labelling) are Modal's tested contract; these
// tests pin the registry-backed rendering + the self-registered hotkey.

// jsdom does not implement HTMLDialogElement.showModal()/close() — polyfill
// the bits Modal relies on (mirrors Modal.svelte.test.ts).
beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  if (!proto.showModal) {
    proto.showModal = function (this: HTMLDialogElement) {
      this.open = true
    }
  }
  if (!proto.close) {
    proto.close = function (this: HTMLDialogElement) {
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
})

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

// Registry hygiene: the singleton persists across tests in this file, so
// every seeded registration is disposed and user overrides reset.
const disposers: Array<() => void> = []
const seed = (options: Omit<ShortcutOptions, 'onPress'> & { onPress?: () => void }) => {
  disposers.push(shortcuts.add({ onPress: () => {}, ...options }))
}
afterEach(() => {
  while (disposers.length) disposers.pop()!()
  shortcuts.resetOverrides()
})

const dialogOf = (container: HTMLElement) =>
  container.querySelector<HTMLDialogElement>('dialog.ss-modal')!

const headingsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.ss-shortcuts-help .group h3')).map(
    (h) => h.textContent ?? '',
  )

const press = async (key: string, init: KeyboardEventInit = {}) => {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  )
  await tick()
}

describe('ShortcutsHelp — registry-backed rendering', () => {
  it('renders a section per group with labels and <Kbd> bindings; General last', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    seed({ id: 't:next', label: 'Next item', keys: 'j', group: 'Navigation' })
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()

    // Insertion order, with the self-registered "General" group forced last.
    expect(headingsOf(container)).toEqual(['Editing', 'Navigation', 'General'])

    const editing = container.querySelector('.ss-shortcuts-help .group')!
    expect(editing.querySelector('dt')).toHaveTextContent('Save')
    const kbd = editing.querySelector('dd .ss-kbd')!
    expect(kbd).not.toBeNull()
    // jsdom is a non-Apple platform: `mod` renders as Ctrl.
    expect(kbd.textContent).toContain('Ctrl')
    expect(kbd.textContent).toContain('S')
  })

  it('buckets ungrouped shortcuts under General, next to the self-registration', async () => {
    seed({ id: 't:thing', label: 'Do the thing', keys: 'mod+9' })
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()
    expect(headingsOf(container)).toEqual(['General'])
    const labels = Array.from(container.querySelectorAll('.ss-shortcuts-help dt .txt')).map(
      (el) => el.textContent,
    )
    expect(labels).toEqual(['Do the thing', 'Show keyboard shortcuts'])
  })

  it('groupOrder reorders sections explicitly; unlisted groups keep default order', async () => {
    seed({ id: 't:a', label: 'A', keys: 'mod+1', group: 'Navigation' })
    seed({ id: 't:b', label: 'B', keys: 'mod+2', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, {
      open: true,
      groupOrder: ['Editing', 'General'],
    })
    await tick()
    expect(headingsOf(container)).toEqual(['Editing', 'General', 'Navigation'])
  })

  it('a remap updates the rendered binding reactively', async () => {
    seed({ id: 't:save', label: 'Save', keys: 's', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()
    const kbd = () => container.querySelector('.ss-shortcuts-help dd .ss-kbd')!
    expect(kbd().textContent).not.toContain('Ctrl')

    shortcuts.remap('t:save', 'mod+shift+s')
    await tick()
    expect(kbd().textContent).toContain('Ctrl')
    expect(kbd().textContent).toContain('Shift')

    shortcuts.remap('t:save', null) // restore default
    await tick()
    expect(kbd().textContent).not.toContain('Ctrl')
  })

  it('disabled shortcuts render struck-through with a visible "(off)"', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()
    const row = () => container.querySelector('.ss-shortcuts-help .row')!
    expect(row()).not.toHaveClass('off')

    shortcuts.setEnabled('t:save', false)
    await tick()
    expect(row()).toHaveClass('off')
    expect(row().querySelector('.off-tag')).toHaveTextContent('(off)')

    shortcuts.setEnabled('t:save', true)
    await tick()
    expect(row()).not.toHaveClass('off')
  })

  it('a registration-level enabled:false shows as off too', async () => {
    seed({ id: 't:ctx', label: 'Contextual', keys: 'mod+u', group: 'Editing', enabled: false })
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()
    expect(container.querySelector('.ss-shortcuts-help .row')).toHaveClass('off')
  })

  it('renders EmptyState instead of a blank dialog when the registry is empty', async () => {
    const { container } = render(ShortcutsHelpHarness, { open: true, hotkey: null })
    await tick()
    expect(container.querySelector('.ss-shortcuts-help .ss-empty')).not.toBeNull()
    expect(container.querySelector('.ss-shortcuts-help dl')).toBeNull()
  })

  it('renders children below the list', async () => {
    const { getByText } = render(ShortcutsHelpHarness, {
      open: true,
      text: 'See the full guide for remapping.',
    })
    await tick()
    expect(getByText('See the full guide for remapping.')).toBeTruthy()
  })
})

describe('ShortcutsHelp — self-registered hotkey', () => {
  it("registers 'ss:shortcuts-help' in shortcuts.items and unregisters on unmount", async () => {
    const { unmount } = render(ShortcutsHelpHarness, {})
    await tick()
    const info = shortcuts.items.find((i) => i.id === 'ss:shortcuts-help')
    expect(info).toMatchObject({
      label: 'Show keyboard shortcuts',
      group: 'General',
      keys: '?, mod+/',
    })
    unmount()
    expect(shortcuts.items.some((i) => i.id === 'ss:shortcuts-help')).toBe(false)
  })

  it('hotkey={null} registers nothing', async () => {
    render(ShortcutsHelpHarness, { hotkey: null })
    await tick()
    expect(shortcuts.items.some((i) => i.id === 'ss:shortcuts-help')).toBe(false)
  })

  it('a hotkey prop change re-registers (no duplicates)', async () => {
    const { rerender } = render(ShortcutsHelpHarness, {})
    await tick()
    await rerender({ hotkey: 'mod+.' })
    const entries = shortcuts.items.filter((i) => i.id === 'ss:shortcuts-help')
    expect(entries).toHaveLength(1)
    expect(entries[0].keys).toBe('mod+.')
  })

  it("'?' opens the overlay (open binds)", async () => {
    const { container } = render(ShortcutsHelpHarness, {})
    await tick()
    const dialog = dialogOf(container)
    expect(dialog.open).toBe(false)
    await press('?')
    expect(dialog.open).toBe(true)
  })

  it("'mod+/' opens it too (Ctrl on non-Apple platforms)", async () => {
    const { container } = render(ShortcutsHelpHarness, {})
    await tick()
    await press('/', { ctrlKey: true })
    expect(dialogOf(container).open).toBe(true)
  })

  it("discovery survives the characterKeys kill switch: '?' dies, mod+/ works", async () => {
    const { container } = render(ShortcutsHelpHarness, {})
    await tick()
    shortcuts.characterKeys = false
    await press('?')
    expect(dialogOf(container).open).toBe(false)
    await press('/', { ctrlKey: true })
    expect(dialogOf(container).open).toBe(true)
  })

  it('is itself disable-able through the registry (WCAG 2.1.4)', async () => {
    const { container } = render(ShortcutsHelpHarness, {})
    await tick()
    shortcuts.setEnabled('ss:shortcuts-help', false)
    await press('?')
    expect(dialogOf(container).open).toBe(false)
  })

  it('closes via the native dialog and reopens from the hotkey (two-way binding)', async () => {
    const { container } = render(ShortcutsHelpHarness, {})
    await tick()
    const dialog = dialogOf(container)
    await press('?')
    expect(dialog.open).toBe(true)
    dialog.close()
    await tick()
    expect(dialog.open).toBe(false)
    await press('?')
    expect(dialog.open).toBe(true)
  })
})

describe('ShortcutsHelp — editable mode (DS-0141)', () => {
  const itemOf = (id: string) => shortcuts.items.find((i) => i.id === id)!
  const statusOf = (container: HTMLElement) =>
    container.querySelector('.ss-shortcuts-help .status')!
  const changeBtn = (container: HTMLElement, label: string) =>
    container.querySelector<HTMLButtonElement>(`[aria-label='Change the shortcut for "${label}"']`)!

  it('non-editable rendering is unchanged: no controls, globals, or status line', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()
    expect(container.querySelector('.ss-shortcuts-help .controls')).toBeNull()
    expect(container.querySelector('.ss-shortcuts-help .globals')).toBeNull()
    expect(container.querySelector('.ss-shortcuts-help .status')).toBeNull()
    expect(container.querySelector('.ss-shortcuts-help [role="switch"]')).toBeNull()
  })

  it('editable renders a per-row Switch, Change button, and the globals footer', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container, getByRole } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    expect(getByRole('switch', { name: 'Enable the "Save" shortcut' })).toBeTruthy()
    expect(changeBtn(container, 'Save')).not.toBeNull()
    expect(getByRole('switch', { name: 'Single-key shortcuts' })).toBeTruthy()
    expect(getByRole('button', { name: 'Restore defaults' })).toBeTruthy()
  })

  it('the per-row Switch calls setEnabled and the row re-renders as off', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const setEnabled = vi.spyOn(shortcuts, 'setEnabled')
    const { container, getByRole } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    const sw = getByRole('switch', { name: 'Enable the "Save" shortcut' })
    await fireEvent.click(sw)
    expect(setEnabled).toHaveBeenCalledWith('t:save', false)
    expect(container.querySelector('.ss-shortcuts-help .row')).toHaveClass('off')
    await fireEvent.click(sw)
    expect(setEnabled).toHaveBeenCalledWith('t:save', true)
    expect(container.querySelector('.ss-shortcuts-help .row')).not.toHaveClass('off')
    setEnabled.mockRestore()
  })

  it('recording captures the next keydown, remaps through the parser, and announces', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    await fireEvent.click(changeBtn(container, 'Save'))
    expect(statusOf(container).textContent).toContain('Press the new shortcut for "Save"')
    expect(container.querySelector('.ss-shortcuts-help .row.recording .prompt')).not.toBeNull()

    await press('s', { ctrlKey: true, shiftKey: true })
    expect(itemOf('t:save').keys).toBe('ctrl+shift+s')
    expect(statusOf(container).textContent).toBe('"Save" is now Ctrl+Shift+S.')
    expect(container.querySelector('.ss-shortcuts-help .row.recording')).toBeNull()
  })

  it('modifier-only keydowns are a chord in progress — recording stays live', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    await fireEvent.click(changeBtn(container, 'Save'))
    await press('Control', { ctrlKey: true })
    expect(itemOf('t:save').keys).toBe('mod+s')
    expect(statusOf(container).textContent).toContain('Press the new shortcut')
  })

  it('Escape cancels recording without changing the binding', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    await fireEvent.click(changeBtn(container, 'Save'))
    await press('Escape')
    expect(itemOf('t:save').keys).toBe('mod+s')
    expect(statusOf(container).textContent).toBe('Shortcut change cancelled.')
    expect(container.querySelector('.ss-shortcuts-help .row.recording')).toBeNull()
  })

  it('reserved browser combos are rejected with feedback; recording stays live', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    await fireEvent.click(changeBtn(container, 'Save'))
    await press('t', { ctrlKey: true })
    expect(itemOf('t:save').keys).toBe('mod+s')
    expect(statusOf(container).textContent).toContain('reserved by the browser')
    // Still recording: a valid combo afterwards is accepted.
    await press('s', { ctrlKey: true })
    expect(itemOf('t:save').keys).toBe('ctrl+s')
  })

  it('unparseable keys (space) are rejected with feedback', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    await fireEvent.click(changeBtn(container, 'Save'))
    await press(' ')
    expect(itemOf('t:save').keys).toBe('mod+s')
    expect(statusOf(container).textContent).toContain('cannot be used')
  })

  it('other shortcuts never fire while recording — the keydown becomes the binding', async () => {
    const onPress = vi.fn()
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    disposers.push(shortcuts.add({ id: 't:other', label: 'Other', keys: 'ctrl+9', onPress }))
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    await fireEvent.click(changeBtn(container, 'Save'))
    await press('9', { ctrlKey: true })
    expect(onPress).not.toHaveBeenCalled()
    expect(itemOf('t:save').keys).toBe('ctrl+9')
  })

  it('per-row Reset appears once remapped and restores the default', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container, queryByRole, getByRole } = render(ShortcutsHelpHarness, {
      open: true,
      editable: true,
    })
    await tick()
    const resetName = 'Reset the shortcut for "Save" to its default'
    expect(queryByRole('button', { name: resetName })).toBeNull()

    shortcuts.remap('t:save', 'ctrl+shift+s')
    await tick()
    await fireEvent.click(getByRole('button', { name: resetName }))
    expect(itemOf('t:save').keys).toBe('mod+s')
    expect(queryByRole('button', { name: resetName })).toBeNull()
    expect(statusOf(container).textContent).toContain('restored to Ctrl+S')
  })

  it('the global Switch flips shortcuts.characterKeys', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { getByRole } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    const sw = getByRole('switch', { name: 'Single-key shortcuts' })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    await fireEvent.click(sw)
    expect(shortcuts.characterKeys).toBe(false)
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('Restore defaults calls resetOverrides and clears every override', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const resetOverrides = vi.spyOn(shortcuts, 'resetOverrides')
    const { getByRole } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    shortcuts.remap('t:save', 'ctrl+shift+s')
    shortcuts.setEnabled('t:save', false)
    shortcuts.characterKeys = false
    await tick()
    await fireEvent.click(getByRole('button', { name: 'Restore defaults' }))
    expect(resetOverrides).toHaveBeenCalled()
    expect(itemOf('t:save')).toMatchObject({ keys: 'mod+s', enabled: true })
    expect(shortcuts.characterKeys).toBe(true)
    resetOverrides.mockRestore()
  })

  it('closing the dialog abandons an in-progress recording', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    await fireEvent.click(changeBtn(container, 'Save'))
    dialogOf(container).close()
    await tick()
    await press('s', { ctrlKey: true, shiftKey: true })
    expect(itemOf('t:save').keys).toBe('mod+s')
  })

  it('has no axe violations in editable mode', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    seed({ id: 't:next', label: 'Next item', keys: 'j', group: 'Navigation' })
    shortcuts.setEnabled('t:next', false)
    const { container } = render(ShortcutsHelpHarness, { open: true, editable: true })
    await tick()
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})

describe('ShortcutsHelp — dialog semantics (per Modal contract)', () => {
  it('composes Modal: dialog.ss-modal labelled by the default title', async () => {
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()
    const dialog = dialogOf(container)
    expect(dialog.open).toBe(true)
    const labelledby = dialog.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    expect(container.querySelector(`#${labelledby}`)).toHaveTextContent('Keyboard shortcuts')
  })

  it('a custom title replaces the default', async () => {
    const { container } = render(ShortcutsHelpHarness, { open: true, title: 'Hotkeys' })
    await tick()
    const labelledby = dialogOf(container).getAttribute('aria-labelledby')
    expect(container.querySelector(`#${labelledby}`)).toHaveTextContent('Hotkeys')
  })

  it('has no axe violations while open (groups + a disabled row)', async () => {
    seed({ id: 't:save', label: 'Save', keys: 'mod+s', group: 'Editing' })
    seed({ id: 't:next', label: 'Next item', keys: 'j', group: 'Navigation' })
    shortcuts.setEnabled('t:next', false)
    const { container } = render(ShortcutsHelpHarness, { open: true })
    await tick()
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
