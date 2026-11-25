import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet, type Component } from 'svelte'
import { axe } from 'vitest-axe'
import Menu from '$lib/components/Menu.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount } from '$lib/vanilla/index'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const raw = (html: string) => createRawSnippet(() => ({ render: () => html }))

function svelteHtml<P extends Record<string, unknown>>(Comp: Component<P>, props: P): string {
  const { container, unmount } = render(Comp, props)
  const html = container.innerHTML
  unmount()
  return html.replace(/ svelte-[a-z0-9]+/g, '').replace(/<!--[^>]*-->/g, '')
}

function mountHtml(html: string): void {
  document.body.innerHTML = html
  mount(document.body)
}

const q = <E extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<E>(sel)!
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
const tick = () => new Promise<void>((r) => queueMicrotask(r))

const ITEMS = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
]

describe('vanilla — Menu accessible name (DS-0177)', () => {
  it('markup copied from an unlabelled Menu is named by its trigger', async () => {
    mountHtml(svelteHtml(Menu, { items: ITEMS, children: raw('Actions') }))
    const panel = q('.panel')
    expect(panel.getAttribute('aria-labelledby')).toBe(q('.trigger').id)
    click(q('.trigger'))
    await tick()
    expect(panel).toHaveAccessibleName('Actions')
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })

  it('hand-authored markup without a name gets aria-labelledby → trigger on open', async () => {
    const html = svelteHtml(Menu, { items: ITEMS, children: raw('Actions') })
      .replace(/ aria-labelledby="[^"]*"/, '')
      .replace(/ id="[^"]*-trigger"/, '')
    mountHtml(html)
    const trigger = q('.trigger')
    const panel = q('.panel')
    expect(panel.hasAttribute('aria-labelledby')).toBe(false)
    expect(trigger.id).toBe('')
    click(trigger)
    await tick()
    expect(trigger.id).not.toBe('')
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id)
    expect(panel).toHaveAccessibleName('Actions')
  })

  it('leaves an authored aria-label alone', async () => {
    mountHtml(svelteHtml(Menu, { items: ITEMS, label: 'Row actions', children: raw('More') }))
    click(q('.trigger'))
    await tick()
    const panel = q('.panel')
    expect(panel.hasAttribute('aria-labelledby')).toBe(false)
    expect(panel).toHaveAccessibleName('Row actions')
  })
})

describe('vanilla — Menu on the shared core (DS-0198)', () => {
  const key = (el: Element, k: string) =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

  it('emits ss:openchange with the same reasons as the Svelte component', async () => {
    mountHtml(svelteHtml(Menu, { items: ITEMS, children: raw('Actions') }))
    const seen: [boolean, string][] = []
    q('.ss-menu').addEventListener('ss:openchange', (e) => {
      const { open, reason } = (e as CustomEvent).detail
      seen.push([open, reason])
    })
    const trigger = q('.trigger')
    const panel = q('.panel')

    click(trigger)
    click(trigger)
    key(trigger, 'ArrowUp')
    await tick()
    expect(document.activeElement).toBe(panel.querySelectorAll('.item')[1])
    key(panel, 'Escape')
    expect(document.activeElement).toBe(trigger)
    click(trigger)
    key(panel, 'Tab')
    click(trigger)
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    click(trigger)
    click(panel.querySelector('.item')!)

    expect(seen).toEqual([
      [true, 'trigger'],
      [false, 'trigger'],
      [true, 'key'],
      [false, 'escape'],
      [true, 'trigger'],
      [false, 'tab'],
      [true, 'trigger'],
      [false, 'outside'],
      [true, 'trigger'],
      [false, 'item'],
    ])
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.getAttribute('aria-hidden')).toBe('true')
    expect(panel.classList.contains('open')).toBe(false)
  })

  it('an item disabled only through aria-disabled is not activated', async () => {
    mountHtml(svelteHtml(Menu, { items: ITEMS, children: raw('Actions') }))
    const selected: number[] = []
    q('.ss-menu').addEventListener('ss:select', (e) =>
      selected.push((e as CustomEvent).detail.index),
    )
    click(q('.trigger'))
    await tick()
    const first = q('.item')
    first.setAttribute('aria-disabled', 'true')
    click(first)
    expect(selected).toEqual([])
    expect(q('.trigger').getAttribute('aria-expanded')).toBe('true')
  })
})
