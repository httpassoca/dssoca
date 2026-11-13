import { describe, it, expect, afterEach, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import TierList from '$lib/components/TierList.svelte'
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

describe('vanilla — TierList RTL (DS-0189)', () => {
  const ITEMS = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
  ]
  const setup = () => {
    document.body.innerHTML = svelteHtml(TierList, {
      items: ITEMS,
      placements: { S: ['a', 'b', 'c'] },
      label: 'Games',
    })
    mount(document.body)
  }
  const zoneIds = (zone: string) =>
    Array.from(document.querySelectorAll<HTMLElement>(`[data-zone="${zone}"] .tile`)).map(
      (t) => t.dataset.item,
    )
  const tile = (id: string) => document.querySelector<HTMLElement>(`.tile[data-item="${id}"]`)!

  it('mirrors ArrowLeft / ArrowRight while a tile is picked up', () => {
    setup()
    forceRtl()
    const a = tile('a')
    a.focus()
    key(a, ' ')
    key(a, 'ArrowLeft') // forward in a right-to-left row
    expect(zoneIds('S')).toEqual(['b', 'a', 'c'])
    key(a, 'ArrowRight')
    expect(zoneIds('S')).toEqual(['a', 'b', 'c'])
    key(a, 'ArrowRight') // already first: nothing
    expect(zoneIds('S')).toEqual(['a', 'b', 'c'])
  })

  it('pointer insertion counts from the right edge', () => {
    setup()
    // Row S laid out right to left: a 900–1000, b 790–890, c 680–780.
    const zones = Array.from(document.querySelectorAll<HTMLElement>('[data-zone]'))
    Array.from(zones[0].querySelectorAll<HTMLElement>(':scope > .cell')).forEach((cell, ci) => {
      const right = 1000 - ci * 110
      const box = { left: right - 100, right, top: 0, bottom: 100 }
      cell.getBoundingClientRect = () => ({ ...box, width: 100, height: 100 }) as DOMRect
      cell.querySelector<HTMLElement>('.tile')!.getBoundingClientRect = cell.getBoundingClientRect
    })
    document.elementsFromPoint = (_x: number, y: number) => {
      const zone = zones[Math.floor(y / 200)]
      return zone ? [zone] : []
    }
    forceRtl()
    const c = tile('c')
    const pointer = (type: string, x: number, y: number) =>
      c.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
        }),
      )
    pointer('pointerdown', 730, 50)
    pointer('pointermove', 980, 60) // right of Alpha's centre
    expect(zoneIds('S')).toEqual(['c', 'a', 'b'])
    pointer('pointerup', 980, 60)
  })
})
