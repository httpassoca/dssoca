import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { createRawSnippet, tick } from 'svelte'
import { axe } from 'vitest-axe'
import SearchPalette, { type SearchPaletteItem } from '$lib/components/SearchPalette.svelte'
import { shortcuts } from '$lib/shortcuts.svelte'

// jsdom implements neither HTMLDialogElement.showModal()/close() nor
// Element.scrollIntoView(). Polyfill the bits the component relies on
// (same dance as the Modal suite).
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
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }))

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const navItems: SearchPaletteItem[] = [
  { id: 'home', label: 'Home', href: '/', group: 'Pages' },
  { id: 'tokens', label: 'Tokens', href: '/tokens', group: 'Pages', keywords: ['colors', 'São'] },
  { id: 'post-1', label: 'Release 0.12', href: '/blog/0-12', group: 'Posts', hint: 'changelog' },
  { id: 'theme', label: 'Toggle theme', group: 'Commands' },
]

const baseProps = () => ({ open: true, items: navItems })

const getInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('.ss-search-palette input')!
const getOptions = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.ss-search-palette [role="option"]'))
const activeOption = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.ss-search-palette [role="option"][aria-selected="true"]')

describe('SearchPalette — rendering', () => {
  it('renders a dialog with the ss-search-palette identity and opens it', () => {
    const { container } = render(SearchPalette, baseProps())
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-search-palette')!
    expect(dialog).not.toBeNull()
    expect(dialog.open).toBe(true)
  })

  it('renders every item as an option, hrefs as real anchors', () => {
    const { container } = render(SearchPalette, baseProps())
    const options = getOptions(container)
    expect(options).toHaveLength(4)
    expect(options[0].tagName).toBe('A')
    expect(options[0]).toHaveAttribute('href', '/')
    // Command item (no href) is a button, not a link.
    const command = options.find((o) => o.textContent?.includes('Toggle theme'))!
    expect(command.tagName).toBe('BUTTON')
  })

  it('renders group labels in first-appearance order', () => {
    const { container } = render(SearchPalette, baseProps())
    const labels = Array.from(container.querySelectorAll('.group-label')).map(
      (el) => el.textContent,
    )
    expect(labels).toEqual(['Pages', 'Posts', 'Commands'])
  })

  it('puts ungrouped items first with a continuous flat index', () => {
    const items: SearchPaletteItem[] = [
      { id: 'a', label: 'Grouped', group: 'G' },
      { id: 'b', label: 'Loose' },
    ]
    const { container } = render(SearchPalette, { open: true, items })
    const options = getOptions(container)
    expect(options.map((o) => o.textContent?.trim())).toEqual(['Loose', 'Grouped'])
    // The first flat option is the active one.
    expect(activeOption(container)?.textContent).toContain('Loose')
  })

  it('renders the hint line and the default footer legend', () => {
    const { container, getByText } = render(SearchPalette, baseProps())
    expect(getByText('changelog')).toBeTruthy()
    expect(container.querySelector('.foot')).toHaveTextContent('↑↓ navigate · ↵ open · esc close')
  })

  it('footerText={false} hides the footer; a footer snippet replaces it', () => {
    const hidden = render(SearchPalette, { ...baseProps(), footerText: false })
    expect(hidden.container.querySelector('.foot')).toBeNull()
    const custom = render(SearchPalette, { ...baseProps(), footer: snippet('<b>legend</b>') })
    expect(custom.container.querySelector('.foot')).toHaveTextContent('legend')
  })

  it('reflects the size prop on data-size-variant', () => {
    const { container } = render(SearchPalette, { ...baseProps(), size: 'lg' })
    expect(container.querySelector('dialog.ss-search-palette')).toHaveAttribute(
      'data-size-variant',
      'lg',
    )
  })
})

describe('SearchPalette — combobox wiring', () => {
  it('wires combobox aria to the listbox and the active option', () => {
    const { container } = render(SearchPalette, baseProps())
    const input = getInput(container)
    expect(input).toHaveAttribute('role', 'combobox')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    const listbox = container.querySelector('[role="listbox"]')!
    expect(input.getAttribute('aria-controls')).toBe(listbox.id)
    expect(input.getAttribute('aria-activedescendant')).toBe(activeOption(container)!.id)
  })

  it('drops aria-activedescendant when there are no results', async () => {
    const { container } = render(SearchPalette, baseProps())
    const input = getInput(container)
    await fireEvent.input(input, { target: { value: 'zzz-no-hit' } })
    expect(input).not.toHaveAttribute('aria-activedescendant')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('SearchPalette — filtering', () => {
  it('shows all items on an empty query (quick-jumps)', () => {
    const { container } = render(SearchPalette, baseProps())
    expect(getOptions(container)).toHaveLength(4)
  })

  it('filters by label substring, case-insensitively', async () => {
    const { container } = render(SearchPalette, baseProps())
    await fireEvent.input(getInput(container), { target: { value: 'RELEASE' } })
    const options = getOptions(container)
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Release 0.12')
  })

  it('matches keywords with a diacritic fold ("sao" hits "São")', async () => {
    const { container } = render(SearchPalette, baseProps())
    await fireEvent.input(getInput(container), { target: { value: 'sao' } })
    const options = getOptions(container)
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Tokens')
  })

  it('renders an empty state (emptyText / empty snippet) when nothing matches', async () => {
    const { container } = render(SearchPalette, { ...baseProps(), emptyText: 'nothing here' })
    await fireEvent.input(getInput(container), { target: { value: 'zzz' } })
    expect(container.querySelector('.state')).toHaveTextContent('nothing here')
    const custom = render(SearchPalette, { ...baseProps(), empty: snippet('<i>void</i>') })
    await fireEvent.input(getInput(custom.container), { target: { value: 'zzz' } })
    expect(custom.container.querySelector('.results i')).toHaveTextContent('void')
  })

  it('filter={false} renders items as given (consumer-owned filtering)', async () => {
    const { container } = render(SearchPalette, { ...baseProps(), filter: false })
    await fireEvent.input(getInput(container), { target: { value: 'zzz-no-hit' } })
    expect(getOptions(container)).toHaveLength(4)
  })

  it('resets the selection to the first result when the query changes', async () => {
    const { container } = render(SearchPalette, baseProps())
    const input = getInput(container)
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(activeOption(container)).toHaveTextContent('Tokens')
    await fireEvent.input(input, { target: { value: 'to' } })
    await tick()
    expect(activeOption(container)?.id).toBe(getOptions(container)[0].id)
  })
})

describe('SearchPalette — keyboard', () => {
  it('ArrowDown/ArrowUp move the selection and wrap around', async () => {
    const { container } = render(SearchPalette, baseProps())
    const input = getInput(container)
    await fireEvent.keyDown(input, { key: 'ArrowUp' }) // wraps to the last
    expect(activeOption(container)).toHaveTextContent('Toggle theme')
    await fireEvent.keyDown(input, { key: 'ArrowDown' }) // wraps back to the first
    expect(activeOption(container)).toHaveTextContent('Home')
  })

  it('PageUp/PageDown jump to the first/last option', async () => {
    const { container } = render(SearchPalette, baseProps())
    const input = getInput(container)
    await fireEvent.keyDown(input, { key: 'PageDown' })
    expect(activeOption(container)).toHaveTextContent('Toggle theme')
    await fireEvent.keyDown(input, { key: 'PageUp' })
    expect(activeOption(container)).toHaveTextContent('Home')
  })

  it('skips disabled items when navigating', async () => {
    const items: SearchPaletteItem[] = [
      { id: 'a', label: 'First' },
      { id: 'b', label: 'Blocked', disabled: true },
      { id: 'c', label: 'Third' },
    ]
    const { container } = render(SearchPalette, { open: true, items })
    await fireEvent.keyDown(getInput(container), { key: 'ArrowDown' })
    expect(activeOption(container)).toHaveTextContent('Third')
  })

  it('Enter fires onselect with the active item and closes the palette', async () => {
    const onselect = vi.fn()
    const { container } = render(SearchPalette, {
      open: true,
      items: [{ id: 'cmd', label: 'Run' }],
      onselect,
    })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-search-palette')!
    await fireEvent.keyDown(getInput(container), { key: 'Enter' })
    expect(onselect).toHaveBeenCalledWith(expect.objectContaining({ id: 'cmd' }))
    expect(dialog.open).toBe(false)
  })

  it('stays open when onselect returns false', async () => {
    const { container } = render(SearchPalette, {
      open: true,
      items: [{ id: 'cmd', label: 'Run' }],
      onselect: () => false,
    })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-search-palette')!
    await fireEvent.keyDown(getInput(container), { key: 'Enter' })
    expect(dialog.open).toBe(true)
  })

  it('Enter on an href item clicks its rendered anchor', async () => {
    const onselect = vi.fn()
    const { container } = render(SearchPalette, { ...baseProps(), onselect })
    const anchor = getOptions(container)[0] as HTMLAnchorElement
    const click = vi.fn((e: MouseEvent) => e.preventDefault()) // jsdom can't navigate
    anchor.addEventListener('click', click)
    await fireEvent.keyDown(getInput(container), { key: 'Enter' })
    expect(click).toHaveBeenCalledTimes(1)
    expect(onselect).toHaveBeenCalledWith(expect.objectContaining({ id: 'home' }))
  })

  it('swallows Tab so focus stays on the input', async () => {
    const { container } = render(SearchPalette, baseProps())
    const e = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true })
    getInput(container).dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
  })
})

describe('SearchPalette — shortcut (registry-backed, DS-0139)', () => {
  // The shortcut registry is a module singleton — restore overrides and any
  // stubbed globals (platform mocks) after each test.
  afterEach(() => {
    shortcuts.resetOverrides()
    vi.unstubAllGlobals()
  })

  const getDialog = (container: HTMLElement) =>
    container.querySelector<HTMLDialogElement>('dialog.ss-search-palette')!
  const find = () => shortcuts.items.find((s) => s.id === 'ss:search-palette')

  it('registers ss:search-palette in the registry and unregisters on unmount', () => {
    const { unmount } = render(SearchPalette, { open: false, items: navItems })
    expect(find()).toMatchObject({
      id: 'ss:search-palette',
      label: 'Open search',
      keys: 'mod+k',
      scope: 'global',
    })
    unmount()
    expect(find()).toBeUndefined()
  })

  it('shortcut={false} registers nothing and ignores the chord', async () => {
    const { container } = render(SearchPalette, {
      open: false,
      items: navItems,
      shortcut: false as const,
    })
    expect(find()).toBeUndefined()
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(getDialog(container).open).toBe(false)
  })

  it('Ctrl+K — not Meta+K — toggles the palette on non-Apple platforms', async () => {
    // DS-0139 behavior change: mod+k narrows to the platform modifier.
    const { container } = render(SearchPalette, { open: false, items: navItems })
    const dialog = getDialog(container)
    await fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(dialog.open).toBe(false)
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(dialog.open).toBe(true)
    // While open, the binding is focus-scoped inside the modal dialog: a
    // window-target chord no longer reaches it (SC 2.1.2 suppression)…
    expect(find()?.scope).toBe('focus')
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(dialog.open).toBe(true)
    // …but from the palette's own input (where focus lives) it toggles closed.
    await fireEvent.keyDown(getInput(container), { key: 'k', ctrlKey: true })
    expect(dialog.open).toBe(false)
    expect(find()?.scope).toBe('global')
  })

  it('Meta+K — not Ctrl+K — toggles the palette on Apple platforms', async () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' })
    const { container } = render(SearchPalette, { open: false, items: navItems })
    const dialog = getDialog(container)
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(dialog.open).toBe(false)
    await fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(dialog.open).toBe(true)
    await fireEvent.keyDown(getInput(container), { key: 'k', metaKey: true })
    expect(dialog.open).toBe(false)
  })

  it('obeys a user-level setEnabled(false) override', async () => {
    const { container } = render(SearchPalette, { open: false, items: navItems })
    shortcuts.setEnabled('ss:search-palette', false)
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(getDialog(container).open).toBe(false)
    shortcuts.setEnabled('ss:search-palette', true)
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(getDialog(container).open).toBe(true)
  })

  it('remap reroutes the trigger — both directions of the toggle', async () => {
    const { container } = render(SearchPalette, { open: false, items: navItems })
    const dialog = getDialog(container)
    shortcuts.remap('ss:search-palette', 'ctrl+shift+p')
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(dialog.open).toBe(false)
    await fireEvent.keyDown(window, { key: 'p', ctrlKey: true, shiftKey: true })
    expect(dialog.open).toBe(true)
    // The focus-scoped (open) registration shares the id, so it follows too.
    await fireEvent.keyDown(getInput(container), { key: 'p', ctrlKey: true, shiftKey: true })
    expect(dialog.open).toBe(false)
  })
})

describe('SearchPalette — closing', () => {
  it('backdrop pointerdown closes and fires onclose', async () => {
    const onclose = vi.fn()
    const { container } = render(SearchPalette, { ...baseProps(), onclose })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-search-palette')!
    await fireEvent.pointerDown(dialog)
    expect(dialog.open).toBe(false)
    expect(onclose).toHaveBeenCalledTimes(1)
  })

  it('a native close event syncs state (Esc path) and resets the query', async () => {
    const { container } = render(SearchPalette, baseProps())
    const input = getInput(container)
    await fireEvent.input(input, { target: { value: 'tok' } })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-search-palette')!
    dialog.close()
    await tick()
    expect(dialog.open).toBe(false)
    expect(input.value).toBe('')
  })

  it('resetOnClose={false} keeps the query across closes', async () => {
    const { container } = render(SearchPalette, { ...baseProps(), resetOnClose: false })
    const input = getInput(container)
    await fireEvent.input(input, { target: { value: 'tok' } })
    container.querySelector<HTMLDialogElement>('dialog.ss-search-palette')!.close()
    await tick()
    expect(input.value).toBe('tok')
  })
})

describe('SearchPalette — custom item snippet', () => {
  it('replaces the default row body', () => {
    const item = createRawSnippet((it: () => SearchPaletteItem) => ({
      render: () => `<span class="custom">${it().label.toUpperCase()}</span>`,
    }))
    const { container } = render(SearchPalette, {
      open: true,
      items: [{ id: 'a', label: 'Home' }],
      item,
    })
    expect(container.querySelector('[role="option"] .custom')).toHaveTextContent('HOME')
  })
})

describe('SearchPalette — a11y', () => {
  it('has no axe violations while open', async () => {
    const { container } = render(SearchPalette, baseProps())
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
