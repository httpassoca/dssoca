import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import Accordion from '$lib/components/Accordion.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount } from '$lib/vanilla/index'

// jsdom has no `inert` IDL attribute, and Svelte sets boolean attributes like
// `inert` as a DOM property — reflect it to the content attribute (as browsers do)
// so the rendered markup can be asserted.
if (!('inert' in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, 'inert', {
    configurable: true,
    get(this: HTMLElement) {
      return this.hasAttribute('inert')
    },
    set(this: HTMLElement, v: boolean) {
      this.toggleAttribute('inert', !!v)
    },
  })
}

const raw = (html: string) => createRawSnippet(() => ({ render: () => html }))

/** The real component's DOM, stripped of scoping hashes + hydration comments (the vanilla contract). */
function accordionHtml(): string {
  const { container, unmount } = render(Accordion, {
    items: [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ],
    idBase: 'acc',
    panel: raw('<p><a href="#x">link</a></p>'),
  })
  const html = container.innerHTML
  unmount()
  return html.replace(/ svelte-[a-z0-9]+/g, '').replace(/<!--[^>]*-->/g, '')
}

const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('vanilla — Accordion closed panels (DS-0162)', () => {
  it('ships closed panels inert in the markup contract', () => {
    document.body.innerHTML = accordionHtml()
    const panels = Array.from(document.querySelectorAll<HTMLElement>('.panel'))
    expect(panels.every((p) => p.hasAttribute('inert'))).toBe(true)
  })

  it('toggles inert together with hidden', () => {
    document.body.innerHTML = accordionHtml()
    mount(document.body)
    const heads = Array.from(document.querySelectorAll<HTMLButtonElement>('.head'))
    const panels = Array.from(document.querySelectorAll<HTMLElement>('.panel'))
    click(heads[0])
    expect(panels[0].hidden).toBe(false)
    expect(panels[0].hasAttribute('inert')).toBe(false)
    expect(panels[1].hasAttribute('inert')).toBe(true)
    click(heads[1]) // single-open: closes the first
    expect(panels[0].hidden).toBe(true)
    expect(panels[0].hasAttribute('inert')).toBe(true)
    expect(panels[1].hasAttribute('inert')).toBe(false)
    click(heads[1])
    expect(panels[1].hasAttribute('inert')).toBe(true)
  })
})
