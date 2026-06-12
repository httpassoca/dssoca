import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { axe } from 'vitest-axe'
import MenuHarness from '../harness/MenuHarness.svelte'
import type { MenuItem } from '$lib/components/Menu.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const ITEMS: MenuItem[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'dup', label: 'Duplicate' },
  { id: 'del', label: 'Delete' },
]

const trigger = (c: HTMLElement) => c.querySelector('.trigger') as HTMLButtonElement
const panel = (c: HTMLElement) => c.querySelector('.panel') as HTMLElement
const itemEls = (c: HTMLElement) => Array.from(c.querySelectorAll('.item')) as HTMLButtonElement[]

describe('Menu', () => {
  it('renders a trigger inside .ss-menu with the popup ARIA wiring', () => {
    const { container } = render(MenuHarness, { items: ITEMS, trigger: 'Actions' })
    const root = container.querySelector('.ss-menu')!
    expect(root).not.toBeNull()
    const t = trigger(container)
    expect(t).toHaveTextContent('Actions')
    expect(t).toHaveAttribute('aria-haspopup', 'menu')
    expect(t).toHaveAttribute('aria-expanded', 'false')
    expect(t).toHaveAttribute('aria-controls', panel(container).id)
  })

  it('renders a role=menu panel with one role=menuitem per item', () => {
    const { container } = render(MenuHarness, { items: ITEMS })
    expect(panel(container)).toHaveAttribute('role', 'menu')
    const rows = itemEls(container)
    expect(rows).toHaveLength(3)
    rows.forEach((r) => expect(r).toHaveAttribute('role', 'menuitem'))
  })

  describe('open / close', () => {
    it('is closed by default (aria-expanded=false, panel aria-hidden)', () => {
      const { container } = render(MenuHarness, { items: ITEMS })
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
      expect(panel(container)).toHaveAttribute('aria-hidden', 'true')
    })

    it('toggles open on trigger click', async () => {
      const { container } = render(MenuHarness, { items: ITEMS })
      await fireEvent.click(trigger(container))
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
      expect(panel(container)).toHaveAttribute('aria-hidden', 'false')
      expect(panel(container)).toHaveClass('open')
      await fireEvent.click(trigger(container))
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on Escape and returns focus to the trigger', async () => {
      const { container } = render(MenuHarness, { items: ITEMS, open: true })
      await fireEvent.keyDown(panel(container), { key: 'Escape' })
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
      expect(document.activeElement).toBe(trigger(container))
    })

    it('closes on outside pointerdown without stealing focus back', async () => {
      const { container } = render(MenuHarness, { items: ITEMS, open: true })
      await fireEvent.pointerDown(document.body)
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
    })

    it('stays open on pointerdown inside the panel', async () => {
      const { container } = render(MenuHarness, { items: ITEMS, open: true })
      await fireEvent.pointerDown(itemEls(container)[0])
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
    })
  })

  // ----------------------------------------------------------------
  //  DS-0067 — SSR safety: guarded document listeners, panelEl null-check
  // ----------------------------------------------------------------

  describe('SSR safety (DS-0067)', () => {
    it('attaches the document pointerdown listener only while open and detaches on close', async () => {
      const addSpy = vi.spyOn(document, 'addEventListener')
      const removeSpy = vi.spyOn(document, 'removeEventListener')
      const pdCalls = (spy: typeof addSpy) =>
        spy.mock.calls.filter(([type]) => type === 'pointerdown').length

      const { container } = render(MenuHarness, { items: ITEMS })
      expect(pdCalls(addSpy)).toBe(0) // closed → no global listener

      await fireEvent.click(trigger(container)) // open
      expect(pdCalls(addSpy)).toBe(1)

      await fireEvent.click(trigger(container)) // close
      expect(pdCalls(removeSpy)).toBe(1)

      addSpy.mockRestore()
      removeSpy.mockRestore()
    })

    it('guards document access and null-checks panelEl before .contains() (DS-0067/DS-0078)', () => {
      // jsdom always has a document, so the no-document branch cannot run
      // here; assert the guards themselves (the option the story's AC allows).
      // (path is cwd-relative — vitest runs from the repo root; import.meta.url
      // is not a file: URL under the jsdom environment)
      const src = readFileSync('src/lib/components/Menu.svelte', 'utf8')
      expect(src).toMatch(/typeof document !== 'undefined'/)
      expect(src).toMatch(/panelEl && panelEl\.contains/)
      expect(src).toMatch(/triggerEl && triggerEl\.contains/)
    })
  })

  describe('selection', () => {
    it('fires item.onSelect and the component onSelect, then closes', async () => {
      const itemSpy = vi.fn()
      const onSelect = vi.fn()
      const items: MenuItem[] = [{ id: 'a', label: 'A', onSelect: itemSpy }]
      const { container } = render(MenuHarness, { items, open: true, onSelect })
      await fireEvent.click(itemEls(container)[0])
      expect(itemSpy).toHaveBeenCalledWith('a')
      expect(onSelect).toHaveBeenCalledWith('a')
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
    })

    it('does not activate disabled items', async () => {
      const onSelect = vi.fn()
      const items: MenuItem[] = [{ id: 'a', label: 'A', disabled: true }]
      const { container } = render(MenuHarness, { items, open: true, onSelect })
      const row = itemEls(container)[0]
      expect(row).toHaveAttribute('aria-disabled', 'true')
      expect(row).toBeDisabled()
      await fireEvent.click(row)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('uses menuitemradio + aria-checked when any item is selectable', () => {
      const items: MenuItem[] = [
        { id: 'dark', label: 'Dark', selected: true },
        { id: 'light', label: 'Light', selected: false },
      ]
      const { container } = render(MenuHarness, { items, open: true })
      const rows = itemEls(container)
      expect(rows[0]).toHaveAttribute('role', 'menuitemradio')
      expect(rows[0]).toHaveAttribute('aria-checked', 'true')
      expect(rows[1]).toHaveAttribute('aria-checked', 'false')
      expect(rows[0]).toHaveClass('selected')
    })
  })

  describe('keyboard navigation', () => {
    it('opens with ArrowDown and focuses the first item', async () => {
      const { container } = render(MenuHarness, { items: ITEMS })
      await fireEvent.keyDown(trigger(container), { key: 'ArrowDown' })
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
      await Promise.resolve()
      expect(document.activeElement).toBe(itemEls(container)[0])
    })

    it('opens with ArrowUp and focuses the last item', async () => {
      const { container } = render(MenuHarness, { items: ITEMS })
      await fireEvent.keyDown(trigger(container), { key: 'ArrowUp' })
      await Promise.resolve()
      expect(document.activeElement).toBe(itemEls(container)[2])
    })

    it('moves focus down/up and wraps', async () => {
      const { container } = render(MenuHarness, { items: ITEMS, open: true })
      const rows = itemEls(container)
      await fireEvent.keyDown(panel(container), { key: 'ArrowDown' }) // -> first
      expect(document.activeElement).toBe(rows[0])
      await fireEvent.keyDown(panel(container), { key: 'ArrowDown' })
      expect(document.activeElement).toBe(rows[1])
      await fireEvent.keyDown(panel(container), { key: 'ArrowUp' })
      expect(document.activeElement).toBe(rows[0])
      await fireEvent.keyDown(panel(container), { key: 'ArrowUp' }) // wrap to last
      expect(document.activeElement).toBe(rows[2])
    })

    it('Home / End jump to the first / last item', async () => {
      const { container } = render(MenuHarness, { items: ITEMS, open: true })
      const rows = itemEls(container)
      await fireEvent.keyDown(panel(container), { key: 'End' })
      expect(document.activeElement).toBe(rows[2])
      await fireEvent.keyDown(panel(container), { key: 'Home' })
      expect(document.activeElement).toBe(rows[0])
    })

    it('skips disabled items during navigation', async () => {
      const items: MenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B', disabled: true },
        { id: 'c', label: 'C' },
      ]
      const { container } = render(MenuHarness, { items, open: true })
      const rows = itemEls(container)
      await fireEvent.keyDown(panel(container), { key: 'ArrowDown' }) // first enabled
      expect(document.activeElement).toBe(rows[0])
      await fireEvent.keyDown(panel(container), { key: 'ArrowDown' }) // skip b -> c
      expect(document.activeElement).toBe(rows[2])
    })

    it('roving tabindex: the focused item is 0, others -1', async () => {
      const { container } = render(MenuHarness, { items: ITEMS, open: true })
      await fireEvent.keyDown(panel(container), { key: 'ArrowDown' })
      const rows = itemEls(container)
      expect(rows[0]).toHaveAttribute('tabindex', '0')
      expect(rows[1]).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('placement', () => {
    it('defaults to bottom / start', () => {
      const { container } = render(MenuHarness, { items: ITEMS })
      const root = container.querySelector('.ss-menu')!
      expect(root).toHaveAttribute('data-side', 'bottom')
      expect(root).toHaveAttribute('data-align', 'start')
    })

    it('reflects align/side props', () => {
      const { container } = render(MenuHarness, { items: ITEMS, align: 'end', side: 'top' })
      const root = container.querySelector('.ss-menu')!
      expect(root).toHaveAttribute('data-align', 'end')
      expect(root).toHaveAttribute('data-side', 'top')
    })
  })

  describe('size', () => {
    it('applies the explicit size as data-size-variant on the root', () => {
      const { container } = render(MenuHarness, { items: ITEMS, size: 'lg' })
      expect(container.querySelector('.ss-menu')).toHaveAttribute('data-size-variant', 'lg')
    })
  })

  // ----------------------------------------------------------------
  //  DS-0088 — custom leading visual per item (leading / swatch / emoji)
  // ----------------------------------------------------------------

  describe('leading visual', () => {
    it('icon items keep rendering an <svg> glyph (unchanged)', () => {
      const items: MenuItem[] = [{ id: 'a', label: 'A', icon: 'grid' }]
      const { container } = render(MenuHarness, { items, open: true })
      expect(itemEls(container)[0].querySelector('svg.ss-icon')).not.toBeNull()
    })

    it('swatch renders a decorative square color chip in the leading slot', () => {
      const items: MenuItem[] = [{ id: 'lime', label: 'Lime', swatch: 'rgb(190, 242, 100)' }]
      const { container } = render(MenuHarness, { items, open: true })
      const chip = itemEls(container)[0].querySelector('.lead.swatch') as HTMLElement
      expect(chip).not.toBeNull()
      expect(chip).toHaveAttribute('aria-hidden', 'true')
      expect(chip.getAttribute('style')).toContain('background: rgb(190, 242, 100)')
      expect(chip.textContent).toBe('')
    })

    it('emoji renders a decorative text glyph in the leading slot', () => {
      const items: MenuItem[] = [{ id: 'pt', label: 'Português', emoji: '🇧🇷' }]
      const { container } = render(MenuHarness, { items, open: true })
      const lead = itemEls(container)[0].querySelector('.lead.emoji') as HTMLElement
      expect(lead).not.toBeNull()
      expect(lead).toHaveAttribute('aria-hidden', 'true')
      expect(lead.textContent).toBe('🇧🇷')
    })

    it('leading snippet renders arbitrary markup, aria-hidden', () => {
      const star = createRawSnippet(() => ({
        render: () => '<b class="custom-lead">★</b>',
      }))
      const items: MenuItem[] = [{ id: 'fav', label: 'Favourites', leading: star }]
      const { container } = render(MenuHarness, { items, open: true })
      const lead = itemEls(container)[0].querySelector('.lead') as HTMLElement
      expect(lead).not.toBeNull()
      expect(lead).toHaveAttribute('aria-hidden', 'true')
      expect(lead.querySelector('.custom-lead')).not.toBeNull()
    })

    it('precedence: leading > swatch > emoji > icon', () => {
      const star = createRawSnippet(() => ({
        render: () => '<b class="custom-lead">★</b>',
      }))
      const items: MenuItem[] = [
        { id: 'a', label: 'A', leading: star, swatch: 'red', emoji: 'x', icon: 'grid' },
        { id: 'b', label: 'B', swatch: 'red', emoji: 'x', icon: 'grid' },
        { id: 'c', label: 'C', emoji: 'x', icon: 'grid' },
      ]
      const { container } = render(MenuHarness, { items, open: true })
      const [a, b, c] = itemEls(container)
      expect(a.querySelector('.custom-lead')).not.toBeNull()
      expect(a.querySelector('.swatch')).toBeNull()
      expect(b.querySelector('.swatch')).not.toBeNull()
      expect(b.querySelector('.emoji')).toBeNull()
      expect(c.querySelector('.emoji')).not.toBeNull()
      // icon loses to every custom leading visual
      ;[a, b, c].forEach((row) => expect(row.querySelector('svg.ss-icon')).toBeNull())
    })

    it('the label still names the row (leading visuals are decorative)', () => {
      const items: MenuItem[] = [
        { id: 'dark', label: 'Dark', swatch: '#111', selected: true },
        { id: 'pt', label: 'Português', emoji: '🇧🇷', selected: false },
      ]
      const { container } = render(MenuHarness, { items, open: true })
      const rows = itemEls(container)
      expect(rows[0]).toHaveAccessibleName('Dark')
      expect(rows[1]).toHaveAccessibleName('Português')
    })

    it('mixed icon + swatch + emoji menu has no axe violations', async () => {
      const items: MenuItem[] = [
        { id: 'i', label: 'Icon row', icon: 'grid' },
        { id: 's', label: 'Swatch row', swatch: '#bef264' },
        { id: 'e', label: 'Emoji row', emoji: '🌐' },
      ]
      const { container } = render(MenuHarness, { items, open: true, label: 'Mixed' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('a11y (axe)', () => {
    it('open action menu has no violations', async () => {
      const { container } = render(MenuHarness, { items: ITEMS, open: true, label: 'Actions' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('open selectable (radio) menu has no violations', async () => {
      const items: MenuItem[] = [
        { id: 'dark', label: 'Dark', icon: 'grid', selected: true },
        { id: 'light', label: 'Light', icon: 'grid', selected: false },
      ]
      const { container } = render(MenuHarness, { items, open: true, label: 'Theme' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
