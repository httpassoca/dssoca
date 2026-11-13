import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet, type Component } from 'svelte'
import Tooltip from '$lib/components/Tooltip.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount } from '$lib/vanilla/index'

const raw = (html: string) => createRawSnippet(() => ({ render: () => html }))

/** Render the real component and hand its static DOM to the vanilla layer (see vanilla-behaviors). */
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
const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

afterEach(() => {
  document.body.innerHTML = ''
})

// DS-0163: aria-describedby on the focusable trigger; document-level Escape.
describe('vanilla — Tooltip (DS-0163)', () => {
  const html = (button = '<button>i</button>') =>
    svelteHtml(Tooltip, { text: 'More info', children: raw(button) })

  it('puts aria-describedby on the focused trigger, not the wrapper', () => {
    mountHtml(html())
    const tip = q('.tip')
    const btn = q('button')
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(btn.getAttribute('aria-describedby')).toBe(tip.id)
    expect(q('.ss-tooltip').hasAttribute('aria-describedby')).toBe(false)
    btn.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
    expect(btn.hasAttribute('aria-describedby')).toBe(false)
  })

  it('describes the first focusable trigger on hover', () => {
    mountHtml(html())
    const btn = q('button')
    btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
    expect(btn.getAttribute('aria-describedby')).toBe(q('.tip').id)
  })

  it("merges with the trigger's own description and restores it on close", () => {
    mountHtml(html('<button aria-describedby="hint-1">i</button>'))
    const btn = q('button')
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(btn.getAttribute('aria-describedby')).toBe(`hint-1 ${q('.tip').id}`)
    key(btn, 'Escape')
    expect(btn.getAttribute('aria-describedby')).toBe('hint-1')
  })

  it('Escape anywhere dismisses a hover-opened tip', () => {
    mountHtml(html() + '<input id="elsewhere" />')
    const tip = q('.tip')
    q('button').dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }),
    )
    expect(tip.hidden).toBe(false)
    key(q('#elsewhere'), 'Escape')
    expect(tip.hidden).toBe(true)
    expect(tip.classList.contains('open')).toBe(false)
  })
})
