import { describe, it, expect, afterEach, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import SegmentedControl from '$lib/components/SegmentedControl.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount } from '$lib/vanilla/index'

/** Real component DOM, stripped of scoping hashes + hydration comments (as in vanilla-behaviors). */
function svelteHtml<P extends Record<string, unknown>>(Comp: Component<P>, props: P): string {
  const { container, unmount } = render(Comp, props)
  const html = container.innerHTML
  unmount()
  return html.replace(/ svelte-[a-z0-9]+/g, '').replace(/<!--[^>]*-->/g, '')
}

const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

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

describe('vanilla — SegmentedControl RTL arrow keys (DS-0172)', () => {
  const OPTIONS = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]
  const setup = () => {
    document.body.innerHTML = svelteHtml(SegmentedControl, {
      options: OPTIONS,
      value: 'day',
      label: 'Range',
    })
    mount(document.body)
    return Array.from(document.querySelectorAll<HTMLButtonElement>('.segment'))
  }

  it('mirrors ArrowLeft / ArrowRight under RTL', () => {
    const segs = setup()
    forceRtl()
    segs[0].focus()
    key(segs[0], 'ArrowLeft')
    expect(document.activeElement).toBe(segs[1])
    expect(segs[1].getAttribute('aria-checked')).toBe('true')
    key(segs[1], 'ArrowRight')
    expect(document.activeElement).toBe(segs[0])
    key(segs[0], 'ArrowRight')
    expect(document.activeElement).toBe(segs[2]) // wraps to the logical end
  })

  it('keeps ArrowDown / ArrowUp logical under RTL', () => {
    const segs = setup()
    forceRtl()
    key(segs[0], 'ArrowDown')
    expect(document.activeElement).toBe(segs[1])
    key(segs[1], 'ArrowUp')
    expect(document.activeElement).toBe(segs[0])
  })

  it('keeps LTR ArrowRight = next', () => {
    const segs = setup()
    key(segs[0], 'ArrowRight')
    expect(document.activeElement).toBe(segs[1])
  })
})
