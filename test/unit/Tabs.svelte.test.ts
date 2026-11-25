import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { axe } from 'vitest-axe'
import Tabs, { type TabItem } from '$lib/components/Tabs.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'logs', label: 'Logs', disabled: true },
  { id: 'shell', label: 'Shell' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const panel = createRawSnippet<[TabItem]>((tab) => ({
  render: () => `<p class="body">Body of ${tab().label}</p>`,
}))

const setup = (props: Record<string, unknown> = {}) =>
  render(Tabs, { tabs: TABS, label: 'Service', panel, ...props })

const tabEls = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLButtonElement>('.tab'))
const panelEls = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('.panel'))
const selectedIds = (c: HTMLElement) =>
  tabEls(c).map((t) => t.getAttribute('aria-selected') === 'true')

// jsdom doesn't inherit `direction` from an ancestor `dir`, so stub the computed style.
function forceRtl() {
  const real = window.getComputedStyle
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
    const cs = real(el, pseudo)
    return new Proxy(cs, { get: (t, k) => (k === 'direction' ? 'rtl' : Reflect.get(t, k)) })
  })
}

afterEach(() => vi.restoreAllMocks())

describe('Tabs', () => {
  it('renders a named tablist with one tab and one panel per item', () => {
    const { container } = setup({ value: 'overview' })
    const root = container.querySelector('.ss-tabs')!
    expect(root).not.toBeNull()
    const list = root.querySelector('.list')!
    expect(list).toHaveAttribute('role', 'tablist')
    expect(list).toHaveAccessibleName('Service')
    expect(tabEls(container)).toHaveLength(4)
    expect(panelEls(container)).toHaveLength(4)
    tabEls(container).forEach((t) => {
      expect(t).toHaveAttribute('role', 'tab')
      expect(t).toHaveAttribute('type', 'button')
    })
  })

  it('wires each tab to its panel (aria-controls / aria-labelledby) and marks the selection', () => {
    const { container } = setup({ value: 'shell' })
    const tabs = tabEls(container)
    const panels = panelEls(container)
    tabs.forEach((t, i) => {
      expect(t.getAttribute('aria-controls')).toBe(panels[i].id)
      expect(panels[i]).toHaveAttribute('role', 'tabpanel')
      expect(panels[i].getAttribute('aria-labelledby')).toBe(t.id)
      expect(panels[i]).toHaveAttribute('tabindex', '0')
    })
    expect(selectedIds(container)).toEqual([false, false, true, false])
    expect(tabs[2]).toHaveClass('selected')
    expect(panels[2]).toHaveAccessibleName('Shell')
  })

  it('shows only the selected panel and renders the snippet with the active tab', () => {
    const { container } = setup({ value: 'shell' })
    const panels = panelEls(container)
    expect(panels.map((p) => p.hidden)).toEqual([true, true, false, true])
    expect(panels[2]).toHaveTextContent('Body of Shell')
    expect(container.querySelectorAll('.body')).toHaveLength(1)
  })

  it('falls back to the first enabled tab when value matches nothing', () => {
    const { container } = setup({ value: 'nope' })
    expect(selectedIds(container)).toEqual([true, false, false, false])
    expect(panelEls(container)[0].hidden).toBe(false)
    const undef = setup()
    expect(selectedIds(undef.container)).toEqual([true, false, false, false])
  })

  it('is ONE tab stop: only the selected tab has tabindex 0', () => {
    const { container } = setup({ value: 'shell' })
    expect(tabEls(container).map((t) => t.tabIndex)).toEqual([-1, -1, 0, -1])
  })

  it('keeps a tab stop on the first enabled tab when the selected one is disabled', () => {
    const { container } = setup({ value: 'logs' })
    expect(tabEls(container).map((t) => t.tabIndex)).toEqual([0, -1, -1, -1])
    expect(panelEls(container)[1].hidden).toBe(false)
  })

  it('stamps the size and activation on the root', () => {
    const { container } = setup({ size: 'sm', activation: 'manual' })
    const root = container.querySelector('.ss-tabs')!
    expect(root).toHaveAttribute('data-size-variant', 'sm')
    expect(root).toHaveAttribute('data-activation', 'manual')
  })

  describe('press', () => {
    it('selects the pressed tab and reports the reason', async () => {
      const onChange = vi.fn()
      const { container } = setup({ value: 'overview', onChange })
      await fireEvent.click(tabEls(container)[2])
      expect(selectedIds(container)).toEqual([false, false, true, false])
      expect(panelEls(container)[2]).toHaveTextContent('Body of Shell')
      expect(onChange).toHaveBeenCalledExactlyOnceWith('shell', { reason: 'press' })
    })

    it('does not fire for the tab that is already selected, nor for a disabled one', async () => {
      const onChange = vi.fn()
      const { container } = setup({ value: 'overview', onChange })
      await fireEvent.click(tabEls(container)[0])
      await fireEvent.click(tabEls(container)[1])
      expect(onChange).not.toHaveBeenCalled()
      expect(tabEls(container)[1]).toBeDisabled()
    })
  })

  describe('keyboard — automatic activation', () => {
    it('arrows move focus and selection together, skipping disabled tabs and wrapping', async () => {
      const onChange = vi.fn()
      const { container } = setup({ value: 'overview', onChange })
      const tabs = tabEls(container)
      tabs[0].focus()
      await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[2])
      expect(selectedIds(container)).toEqual([false, false, true, false])
      expect(onChange).toHaveBeenLastCalledWith('shell', { reason: 'key' })
      await fireEvent.keyDown(tabs[2], { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[0])
      await fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[3])
      expect(onChange).toHaveBeenLastCalledWith('settings', { reason: 'key' })
    })

    it('Home / End jump to the ends', async () => {
      const { container } = setup({ value: 'shell' })
      const tabs = tabEls(container)
      await fireEvent.keyDown(tabs[2], { key: 'End' })
      expect(document.activeElement).toBe(tabs[3])
      await fireEvent.keyDown(tabs[3], { key: 'Home' })
      expect(document.activeElement).toBe(tabs[0])
      expect(selectedIds(container)).toEqual([true, false, false, false])
    })

    it('swaps ArrowLeft / ArrowRight under RTL', async () => {
      const { container } = setup({ value: 'overview' })
      const tabs = tabEls(container)
      forceRtl()
      await fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[2])
      await fireEvent.keyDown(tabs[2], { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('cancels the handled keys and leaves the others alone', async () => {
      const { container } = setup({ value: 'overview' })
      const tabs = tabEls(container)
      expect(await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })).toBe(false)
      expect(await fireEvent.keyDown(tabs[2], { key: 'ArrowDown' })).toBe(true)
      expect(await fireEvent.keyDown(tabs[2], { key: 'Enter' })).toBe(true)
      expect(selectedIds(container)).toEqual([false, false, true, false])
    })
  })

  describe('keyboard — manual activation', () => {
    it('arrows only move focus; Enter / Space select the focused tab', async () => {
      const onChange = vi.fn()
      const { container } = setup({ value: 'overview', activation: 'manual', onChange })
      const tabs = tabEls(container)
      tabs[0].focus()
      await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[2])
      expect(selectedIds(container)).toEqual([true, false, false, false])
      // The tab stop stays on the selected tab.
      expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1, -1])
      expect(onChange).not.toHaveBeenCalled()

      await fireEvent.keyDown(tabs[2], { key: 'Enter' })
      expect(selectedIds(container)).toEqual([false, false, true, false])
      expect(onChange).toHaveBeenCalledExactlyOnceWith('shell', { reason: 'key' })

      await fireEvent.keyDown(tabs[2], { key: 'End' })
      await fireEvent.keyDown(tabs[3], { key: ' ' })
      expect(onChange).toHaveBeenLastCalledWith('settings', { reason: 'key' })
      // The click a browser may still fire after the key does not report twice.
      await fireEvent.click(tabs[3])
      expect(onChange).toHaveBeenCalledTimes(2)
    })
  })

  it('follows a value changed by the parent', async () => {
    const { container, rerender } = setup({ value: 'overview' })
    await rerender({ value: 'settings' })
    expect(selectedIds(container)).toEqual([false, false, false, true])
    expect(panelEls(container)[3]).toHaveTextContent('Body of Settings')
  })

  it('renders an optional leading icon, hidden from the a11y tree', () => {
    const { container } = setup()
    const icon = tabEls(container)[3].querySelector('svg')
    expect(icon).not.toBeNull()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(tabEls(container)[3]).toHaveAccessibleName('Settings')
  })

  describe('a11y (axe)', () => {
    it('automatic activation', async () => {
      const { container } = setup({ value: 'shell' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('manual activation, no value', async () => {
      const { container } = setup({ activation: 'manual' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
