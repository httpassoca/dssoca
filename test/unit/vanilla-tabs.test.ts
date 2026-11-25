import { describe, it, expect, afterEach, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet, type Component } from 'svelte'
import { axe } from 'vitest-axe'
import Tabs from '$lib/components/Tabs.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount, selectTab } from '$lib/vanilla/index'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

/** Real component DOM, stripped of scoping hashes + hydration comments (as in vanilla-behaviors). */
function svelteHtml<P extends Record<string, unknown>>(Comp: Component<P>, props: P): string {
  const { container, unmount } = render(Comp, props)
  const html = container.innerHTML
  unmount()
  return html.replace(/ svelte-[a-z0-9]+/g, '').replace(/<!--[^>]*-->/g, '')
}

const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

// jsdom doesn't inherit `direction` from an ancestor `dir`, so stub the computed style.
function forceRtl() {
  const real = window.getComputedStyle
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
    const cs = real(el, pseudo)
    return new Proxy(cs, { get: (t, k) => (k === 'direction' ? 'rtl' : Reflect.get(t, k)) })
  })
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'logs', label: 'Logs', disabled: true },
  { id: 'shell', label: 'Shell' },
  { id: 'settings', label: 'Settings' },
]
const panel = createRawSnippet(() => ({ render: () => '<p>Body</p>' }))

function setup(props: Record<string, unknown> = {}) {
  document.body.innerHTML = svelteHtml(Tabs as unknown as Component<Record<string, unknown>>, {
    tabs: TABS,
    value: 'overview',
    label: 'Service',
    panel,
    ...props,
  })
  mount(document.body)
  const root = document.querySelector<HTMLElement>('.ss-tabs')!
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('.tab'))
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.panel'))
  // What a plain-HTML author adds: a value per tab.
  tabs.forEach((t, i) => (t.dataset.value = TABS[i].id))
  const seen: unknown[] = []
  root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
  return { root, tabs, panels, seen }
}

const selected = (tabs: HTMLElement[]) => tabs.map((t) => t.getAttribute('aria-selected'))

describe('vanilla — Tabs on the shared core (DS-0197)', () => {
  it('a press selects the tab, toggles the panels and emits ss:change', () => {
    const { tabs, panels, seen } = setup()
    click(tabs[2])
    expect(selected(tabs)).toEqual(['false', 'false', 'true', 'false'])
    expect(tabs[2].classList.contains('selected')).toBe(true)
    expect(tabs[0].classList.contains('selected')).toBe(false)
    expect(tabs.map((t) => t.tabIndex)).toEqual([-1, -1, 0, -1])
    expect(panels.map((p) => p.hidden)).toEqual([true, true, false, true])
    expect(seen).toEqual([{ value: 'shell', index: 2, reason: 'press' }])
    // The authored wiring survives.
    tabs.forEach((t, i) => expect(t.getAttribute('aria-controls')).toBe(panels[i].id))
  })

  it('ignores the selected tab and disabled tabs', () => {
    const { tabs, seen } = setup()
    click(tabs[0])
    click(tabs[1])
    tabs[3].setAttribute('aria-disabled', 'true')
    click(tabs[3])
    expect(seen).toEqual([])
    expect(selected(tabs)).toEqual(['true', 'false', 'false', 'false'])
  })

  it('arrows / Home / End select and focus, skipping disabled tabs', () => {
    const { tabs, panels, seen } = setup()
    tabs[0].focus()
    key(tabs[0], 'ArrowRight')
    expect(document.activeElement).toBe(tabs[2])
    expect(panels.map((p) => p.hidden)).toEqual([true, true, false, true])
    key(tabs[2], 'End')
    expect(document.activeElement).toBe(tabs[3])
    key(tabs[3], 'ArrowRight')
    expect(document.activeElement).toBe(tabs[0])
    key(tabs[0], 'Home')
    expect(seen).toEqual([
      { value: 'shell', index: 2, reason: 'key' },
      { value: 'settings', index: 3, reason: 'key' },
      { value: 'overview', index: 0, reason: 'key' },
    ])
  })

  it('mirrors ArrowLeft / ArrowRight under RTL', () => {
    const { tabs } = setup()
    forceRtl()
    tabs[0].focus()
    key(tabs[0], 'ArrowLeft')
    expect(document.activeElement).toBe(tabs[2])
    key(tabs[2], 'ArrowRight')
    expect(document.activeElement).toBe(tabs[0])
  })

  it('data-activation="manual": arrows move focus only, Enter / Space select', () => {
    const { tabs, panels, seen } = setup({ activation: 'manual' })
    tabs[0].focus()
    key(tabs[0], 'ArrowRight')
    expect(document.activeElement).toBe(tabs[2])
    expect(selected(tabs)).toEqual(['true', 'false', 'false', 'false'])
    expect(seen).toEqual([])
    key(tabs[2], 'Enter')
    expect(panels.map((p) => p.hidden)).toEqual([true, true, false, true])
    key(tabs[2], 'End')
    key(tabs[3], ' ')
    expect(seen).toEqual([
      { value: 'shell', index: 2, reason: 'key' },
      { value: 'settings', index: 3, reason: 'key' },
    ])
  })

  it('falls back to the label text as value and to panel order without aria-controls', () => {
    const { tabs, panels, seen } = setup()
    tabs.forEach((t) => {
      delete t.dataset.value
      t.removeAttribute('aria-controls')
    })
    selectTab(tabs[3])
    expect(seen).toEqual([{ value: 'Settings', index: 3, reason: 'press' }])
    expect(panels.map((p) => p.hidden)).toEqual([true, true, true, false])
    expect(tabs[3].hasAttribute('aria-controls')).toBe(false)
  })

  it('the toggled markup passes axe', async () => {
    const { tabs } = setup()
    click(tabs[2])
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})
