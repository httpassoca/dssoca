import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet, type Component } from 'svelte'
import { axe } from 'vitest-axe'
import Popover from '$lib/components/Popover.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount, openPopover, closePopover } from '$lib/vanilla/index'

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

const q = <E extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<E>(sel)!
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
const tick = () => new Promise<void>((r) => queueMicrotask(r))

const CONTENT = '<div><button type="button" id="first">first</button><a href="/x">link</a></div>'

function setup(props: Record<string, unknown> = {}, content = CONTENT) {
  const html = svelteHtml(Popover as unknown as Component<Record<string, unknown>>, {
    trigger: raw('<span>Filters</span>'),
    children: raw(content),
    ...props,
  })
  document.body.innerHTML = `<button id="before">before</button>${html}<button id="after">after</button>`
  mount(document.body)
  const seen: [boolean, string][] = []
  q('.ss-popover').addEventListener('ss:openchange', (e) => {
    const { open, reason } = (e as CustomEvent).detail
    seen.push([open, reason])
  })
  return { trigger: q<HTMLButtonElement>('.trigger'), panel: q('.panel'), seen }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('vanilla — Popover on the shared core (DS-0197)', () => {
  it('opens on a trigger press, lifts inert and focuses the first focusable', async () => {
    const { trigger, panel, seen } = setup()
    expect(panel.hasAttribute('inert')).toBe(true)
    click(trigger)
    await tick()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hasAttribute('inert')).toBe(false)
    expect(panel.classList.contains('open')).toBe(true)
    expect(document.activeElement).toBe(q('#first'))
    expect(seen).toEqual([[true, 'trigger']])
  })

  it('focuses the panel when it holds nothing focusable', async () => {
    const { trigger, panel } = setup({}, '<p>Just text.</p>')
    click(trigger)
    await tick()
    expect(document.activeElement).toBe(panel)
  })

  it('emits ss:openchange with the same reasons as the Svelte component', async () => {
    const { trigger, panel, seen } = setup()

    click(trigger)
    await tick()
    click(trigger)
    expect(document.activeElement).toBe(trigger)

    click(trigger)
    await tick()
    key(q('#first'), 'Escape')
    expect(document.activeElement).toBe(trigger)

    click(trigger)
    await tick()
    q('#before').dispatchEvent(new Event('pointerdown', { bubbles: true }))

    click(trigger)
    await tick()
    q('#after').focus() // what Tab from the last element does
    expect(document.activeElement).toBe(q('#after'))

    expect(seen).toEqual([
      [true, 'trigger'],
      [false, 'trigger'],
      [true, 'trigger'],
      [false, 'escape'],
      [true, 'trigger'],
      [false, 'outside'],
      [true, 'trigger'],
      [false, 'tab'],
    ])
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hasAttribute('inert')).toBe(true)
    expect(panel.classList.contains('open')).toBe(false)
  })

  it('stays open while focus moves inside, on an inside pointerdown, and on a used Escape', async () => {
    const { trigger, seen } = setup()
    click(trigger)
    await tick()
    trigger.focus()
    q('#first').focus()
    q('#first').dispatchEvent(new Event('pointerdown', { bubbles: true }))
    const used = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    used.preventDefault()
    q('#first').dispatchEvent(used)
    key(q('#first'), 'Enter')
    expect(seen).toEqual([[true, 'trigger']])
  })

  it('openPopover / closePopover drive it from code', async () => {
    const { trigger, panel, seen } = setup()
    openPopover(trigger)
    openPopover(trigger)
    await tick()
    expect(panel.classList.contains('open')).toBe(true)
    closePopover(panel, false)
    expect(document.activeElement).not.toBe(trigger)
    closePopover(trigger)
    expect(seen).toEqual([
      [true, 'trigger'],
      [false, 'trigger'],
    ])
  })

  it('names an unnamed panel by its trigger on open and leaves an authored label alone', async () => {
    const a = setup()
    a.panel.removeAttribute('aria-labelledby')
    a.trigger.removeAttribute('id')
    click(a.trigger)
    await tick()
    expect(a.trigger.id).not.toBe('')
    expect(a.panel).toHaveAccessibleName('Filters')
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()

    const b = setup({ label: 'Log filters' })
    click(b.trigger)
    await tick()
    expect(b.panel.hasAttribute('aria-labelledby')).toBe(false)
    expect(b.panel).toHaveAccessibleName('Log filters')
  })
})
