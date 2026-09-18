import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet, type Component } from 'svelte'
import { axe } from 'vitest-axe'
import Accordion from '$lib/components/Accordion.svelte'
import Menu from '$lib/components/Menu.svelte'
import Modal from '$lib/components/Modal.svelte'
import Tooltip from '$lib/components/Tooltip.svelte'
import Switch from '$lib/components/Switch.svelte'
import SegmentedControl from '$lib/components/SegmentedControl.svelte'
import TierList from '$lib/components/TierList.svelte'
import Input from '$lib/components/Input.svelte'
import NumberField from '$lib/components/NumberField.svelte'
import Textarea from '$lib/components/Textarea.svelte'
import Icon from '$lib/components/Icon.svelte'
import { PATHS } from '$lib/icons'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount, iconSvg, hydrateIcons, readPlacements } from '$lib/vanilla/index'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const raw = (html: string) => createRawSnippet(() => ({ render: () => html }))

/**
 * Pin the markup contract: render the REAL Svelte component, take its DOM, strip the
 * scoping hashes + hydration comments and hand that static HTML to the vanilla layer —
 * exactly what a consumer copying a docs snippet does. No Svelte listeners survive the copy.
 */
function svelteHtml<P extends Record<string, unknown>>(Comp: Component<P>, props: P): string {
  const { container, unmount } = render(Comp, props)
  const html = container.innerHTML
  unmount()
  return html.replace(/ svelte-[a-z0-9]+/g, '').replace(/<!--[^>]*-->/g, '')
}

function mountHtml(html: string): HTMLElement {
  document.body.innerHTML = html
  mount(document.body)
  return document.body
}

const q = <E extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<E>(sel)!
const qa = <E extends HTMLElement = HTMLElement>(sel: string) =>
  Array.from(document.querySelectorAll<E>(sel))
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
const pointerdown = (el: Element) =>
  el.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }))
const tick = () => new Promise<void>((r) => queueMicrotask(r))

beforeAll(() => {
  // jsdom has no <dialog> modal machinery; the vanilla layer only calls these two.
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('vanilla — Modal', () => {
  const html = () =>
    svelteHtml(Modal, { open: false, title: 'Confirm', children: raw('<p>Sure?</p>') })
      .replace('<dialog', '<dialog id="m"')
      .replace('class="close"', 'class="close" data-ss-dismiss')

  it('opens from a data-ss-modal opener and closes from data-ss-dismiss', () => {
    mountHtml(`<button data-ss-modal="#m">open</button>${html()}`)
    const dialog = q<HTMLDialogElement>('dialog.ss-modal')
    expect(dialog.open).toBe(false)
    click(q('[data-ss-modal]'))
    expect(dialog.open).toBe(true)
    click(q('.close'))
    expect(dialog.open).toBe(false)
  })

  it('closes on backdrop pointerdown unless data-ss-static', () => {
    mountHtml(html())
    const dialog = q<HTMLDialogElement>('dialog.ss-modal')
    dialog.showModal()
    pointerdown(q('.panel')) // inside the panel: stays
    expect(dialog.open).toBe(true)
    pointerdown(dialog) // the backdrop hit-test: target is the dialog itself
    expect(dialog.open).toBe(false)
    dialog.setAttribute('data-ss-static', '')
    dialog.showModal()
    pointerdown(dialog)
    expect(dialog.open).toBe(true)
  })

  it('has no axe violations while open', async () => {
    mountHtml(html())
    q<HTMLDialogElement>('dialog').showModal()
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})

describe('vanilla — Accordion', () => {
  const ITEMS = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma', disabled: true },
  ]
  const html = (multiple = false) =>
    svelteHtml(Accordion, {
      items: ITEMS,
      idBase: 'acc',
      panel: raw('<p>body</p>'),
    }).replace('class="ss-accordion"', `class="ss-accordion"${multiple ? ' data-ss-multiple' : ''}`)

  it('toggles the referenced panel and keeps a single item open by default', () => {
    mountHtml(html())
    const heads = qa<HTMLButtonElement>('.head')
    const panels = qa('.panel')
    expect(panels.every((p) => p.hidden)).toBe(true)
    click(heads[0])
    expect(panels[0].hidden).toBe(false)
    expect(heads[0].getAttribute('aria-expanded')).toBe('true')
    expect(heads[0].closest('.item')!.classList.contains('open')).toBe(true)
    click(heads[1])
    expect(panels[0].hidden).toBe(true)
    expect(panels[1].hidden).toBe(false)
    click(heads[1])
    expect(panels[1].hidden).toBe(true)
  })

  it('data-ss-multiple keeps several open; disabled headers are inert; emits ss:change', () => {
    const root = mountHtml(html(true)).firstElementChild as HTMLElement
    const seen: unknown[] = []
    root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail.value))
    const heads = qa<HTMLButtonElement>('.head')
    click(heads[0])
    click(heads[1])
    expect(qa('.panel').map((p) => p.hidden)).toEqual([false, false, true])
    click(heads[2])
    expect(qa('.panel')[2].hidden).toBe(true)
    expect(seen).toEqual([['acc-p-a'], ['acc-p-a', 'acc-p-b']])
  })

  it('roves focus with Arrow/Home/End (wrapping)', () => {
    mountHtml(html())
    const heads = qa<HTMLButtonElement>('.head')
    heads[0].focus()
    key(heads[0], 'ArrowDown')
    expect(document.activeElement).toBe(heads[1])
    key(heads[1], 'End')
    expect(document.activeElement).toBe(heads[2])
    key(heads[2], 'ArrowDown')
    expect(document.activeElement).toBe(heads[0])
    key(heads[0], 'ArrowUp')
    expect(document.activeElement).toBe(heads[2])
    key(heads[2], 'Home')
    expect(document.activeElement).toBe(heads[0])
  })

  it('has no axe violations with a panel open', async () => {
    mountHtml(html())
    click(q('.head'))
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})

describe('vanilla — Menu', () => {
  const ITEMS = [
    { id: 'one', label: 'One' },
    { id: 'two', label: 'Two', disabled: true },
    { id: 'three', label: 'Three' },
  ]
  const html = () => svelteHtml(Menu, { items: ITEMS, label: 'Actions', children: raw('Open') })

  it('opens on click, focuses the first enabled item, and closes on Escape returning focus', async () => {
    mountHtml(html())
    const trigger = q<HTMLButtonElement>('.trigger')
    const panel = q('.panel')
    click(trigger)
    await tick()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(panel.classList.contains('open')).toBe(true)
    expect(panel.getAttribute('aria-hidden')).toBe('false')
    const items = qa<HTMLButtonElement>('.item')
    expect(document.activeElement).toBe(items[0])
    expect(items[0].tabIndex).toBe(0)
    key(panel, 'ArrowDown')
    expect(document.activeElement).toBe(items[2]) // skips the disabled one
    key(panel, 'ArrowDown')
    expect(document.activeElement).toBe(items[0]) // wraps
    key(panel, 'End')
    expect(document.activeElement).toBe(items[2])
    key(panel, 'Escape')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(panel.getAttribute('aria-hidden')).toBe('true')
    expect(document.activeElement).toBe(trigger)
  })

  it('keyboard on the trigger opens (ArrowUp → last), outside pointerdown closes silently', async () => {
    mountHtml(`${html()}<p id="out">outside</p>`)
    const trigger = q<HTMLButtonElement>('.trigger')
    key(trigger, 'ArrowUp')
    await tick()
    expect(document.activeElement).toBe(qa('.item')[2])
    pointerdown(q('#out'))
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).not.toBe(trigger)
  })

  it('activating an item emits ss:select and closes', async () => {
    const root = mountHtml(html()).firstElementChild as HTMLElement
    const seen: unknown[] = []
    root.addEventListener('ss:select', (e) => seen.push((e as CustomEvent).detail))
    click(q('.trigger'))
    await tick()
    qa('.item')[2].setAttribute('data-value', 'three')
    click(qa('.item')[2])
    expect(seen).toEqual([{ index: 2, value: 'three' }])
    expect(q('.trigger').getAttribute('aria-expanded')).toBe('false')
  })

  it('moves the check marker between menuitemradio items', async () => {
    mountHtml(
      svelteHtml(Menu, {
        items: [
          { id: 'a', label: 'A', selected: true },
          { id: 'b', label: 'B', selected: false },
        ],
        children: raw('Open'),
      }),
    )
    click(q('.trigger'))
    await tick()
    const [a, b] = qa('.item')
    expect(a.querySelector('.marker svg')).not.toBeNull()
    click(b)
    expect(b.getAttribute('aria-checked')).toBe('true')
    expect(b.classList.contains('selected')).toBe(true)
    expect(b.querySelector('.marker svg')).not.toBeNull()
    expect(a.getAttribute('aria-checked')).toBe('false')
    expect(a.querySelector('.marker svg')).toBeNull()
  })

  it('has no axe violations while open', async () => {
    mountHtml(html())
    click(q('.trigger'))
    await tick()
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})

describe('vanilla — Tooltip', () => {
  const html = () => svelteHtml(Tooltip, { text: 'More info', children: raw('<button>i</button>') })

  it('shows on focus/hover, hides on blur/leave/Escape, wires aria-describedby', () => {
    mountHtml(html())
    const root = q('.ss-tooltip')
    const tip = q('.tip')
    const btn = q('button')
    expect(tip.hidden).toBe(true)
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(tip.hidden).toBe(false)
    expect(tip.classList.contains('open')).toBe(true)
    expect(root.getAttribute('aria-describedby')).toBe(tip.id)
    key(btn, 'Escape')
    expect(tip.hidden).toBe(true)
    expect(root.hasAttribute('aria-describedby')).toBe(false)
    btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }))
    expect(tip.hidden).toBe(false)
    btn.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
    expect(tip.hidden).toBe(true)
  })
})

describe('vanilla — Switch', () => {
  it('toggles from the track and from the label; disabled is inert; emits ss:change', () => {
    const root = mountHtml(svelteHtml(Switch, { label: 'Wifi', id: 'w' }))
      .firstElementChild as HTMLElement
    const seen: boolean[] = []
    root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail.checked))
    const track = q<HTMLButtonElement>('.track')
    click(track)
    expect(track.getAttribute('aria-checked')).toBe('true')
    expect(track.classList.contains('on')).toBe(true)
    click(q('.label'))
    expect(track.getAttribute('aria-checked')).toBe('false')
    track.disabled = true
    click(q('.label'))
    expect(track.getAttribute('aria-checked')).toBe('false')
    expect(seen).toEqual([true, false])
  })

  it('has no axe violations', async () => {
    mountHtml(svelteHtml(Switch, { label: 'Wifi', id: 'w' }))
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})

describe('vanilla — SegmentedControl', () => {
  const OPTIONS = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week', disabled: true },
    { value: 'month', label: 'Month' },
  ]
  const html = () =>
    svelteHtml(SegmentedControl, { options: OPTIONS, value: 'day', label: 'Range' })

  it('click selects; arrows select+focus skipping disabled and wrapping; emits ss:change', () => {
    const root = mountHtml(html()).firstElementChild as HTMLElement
    const seen: unknown[] = []
    root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
    const segs = qa<HTMLButtonElement>('.segment')
    expect(segs[0].getAttribute('aria-checked')).toBe('true')
    click(segs[2])
    expect(segs[2].getAttribute('aria-checked')).toBe('true')
    expect(segs[2].classList.contains('selected')).toBe(true)
    expect(segs[0].getAttribute('aria-checked')).toBe('false')
    expect(segs.map((s) => s.tabIndex)).toEqual([-1, -1, 0])
    segs[2].focus()
    key(segs[2], 'ArrowRight')
    expect(document.activeElement).toBe(segs[0])
    expect(segs[0].getAttribute('aria-checked')).toBe('true')
    key(segs[0], 'ArrowLeft')
    expect(document.activeElement).toBe(segs[2])
    key(segs[2], 'Home')
    expect(document.activeElement).toBe(segs[0])
    expect(seen.map((d) => (d as { value: string }).value)).toEqual([
      'Month',
      'Day',
      'Month',
      'Day',
    ])
  })

  it('has no axe violations', async () => {
    mountHtml(html())
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})

describe('vanilla — TierList (DS-0159)', () => {
  const ITEMS = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
  ]
  const html = (extra: Record<string, unknown> = {}) =>
    svelteHtml(TierList, { items: ITEMS, placements: { S: ['a', 'b'] }, label: 'Games', ...extra })
  const zoneIds = (zone: string) =>
    qa<HTMLElement>(
      zone === 'tray' ? '[data-zone][data-tray] .tile' : `[data-zone="${zone}"] .tile`,
    ).map((t) => t.dataset.item)
  const tile = (id: string) => q<HTMLButtonElement>(`.tile[data-item="${id}"]`)
  const live = () => q('.ss-tierlist .live').textContent?.trim()

  it('reads the placements the markup carries', () => {
    const root = mountHtml(html()).firstElementChild as HTMLElement
    expect(readPlacements(root)).toEqual({ S: ['a', 'b'], A: [], B: [], C: [], D: [] })
    expect(zoneIds('tray')).toEqual(['c'])
  })

  it('Space grabs, arrows move within and across rows, Space drops and emits ss:change', () => {
    const root = mountHtml(html()).firstElementChild as HTMLElement
    const seen: unknown[] = []
    root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
    const a = tile('a')
    a.focus()
    key(a, ' ')
    expect(a.getAttribute('aria-pressed')).toBe('true')
    expect(a.closest('.cell')?.classList.contains('grabbed')).toBe(true)
    expect(root.classList.contains('sorting')).toBe(true)
    expect(live()).toMatch(/^Picked up Alpha, S, position 1 of 2\./)
    key(a, 'ArrowRight')
    expect(zoneIds('S')).toEqual(['b', 'a'])
    expect(live()).toBe('Alpha moved to S, position 2 of 2.')
    key(a, 'ArrowRight') // edge: nothing
    expect(zoneIds('S')).toEqual(['b', 'a'])
    key(a, 'ArrowDown')
    expect(zoneIds('A')).toEqual(['a'])
    expect(document.activeElement).toBe(a)
    expect(a.getAttribute('aria-pressed')).toBe('true')
    key(a, 'ArrowDown')
    key(a, 'End')
    key(a, ' ')
    expect(a.getAttribute('aria-pressed')).toBe('false')
    expect(root.classList.contains('sorting')).toBe(false)
    expect(live()).toBe('Dropped Alpha in B, position 1 of 1.')
    expect(seen).toEqual([{ placements: { S: ['b'], A: [], B: ['a'], C: [], D: [] } }])
  })

  it('Escape puts the tile back where it was; a blur while grabbed cancels too', async () => {
    const root = mountHtml(html()).firstElementChild as HTMLElement
    const seen: unknown[] = []
    root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
    const b = tile('b')
    b.focus()
    key(b, ' ')
    key(b, 'ArrowDown')
    key(b, 'ArrowDown')
    expect(zoneIds('B')).toEqual(['b'])
    key(b, 'Escape')
    expect(zoneIds('S')).toEqual(['a', 'b'])
    expect(live()).toBe('Cancelled. Beta returned to S, position 2 of 2.')
    expect(b.getAttribute('aria-pressed')).toBe('false')
    key(b, ' ')
    key(b, 'ArrowLeft')
    expect(zoneIds('S')).toEqual(['b', 'a'])
    // the cancel is decided a macrotask after focus has really left the tile
    b.blur()
    await new Promise<void>((r) => setTimeout(r, 0))
    expect(zoneIds('S')).toEqual(['a', 'b'])
    expect(b.getAttribute('aria-pressed')).toBe('false')
    expect(seen).toEqual([])
  })

  it('Enter grabs unless the tile carries data-ss-activate (an onselect consumer)', () => {
    mountHtml(html())
    key(tile('a'), 'Enter')
    expect(tile('a').getAttribute('aria-pressed')).toBe('true')
    key(tile('a'), 'Enter')
    expect(tile('a').getAttribute('aria-pressed')).toBe('false')
    tile('b').setAttribute('data-ss-activate', '')
    key(tile('b'), 'Enter')
    expect(tile('b').getAttribute('aria-pressed')).toBe('false')
  })

  it('pointer drag moves a tile into another row and emits once on release', () => {
    const root = mountHtml(html()).firstElementChild as HTMLElement
    const seen: unknown[] = []
    root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
    // One zone per 200px band; every cell 100px wide from x = 0.
    const zones = qa<HTMLElement>('[data-zone]')
    zones.forEach((zone, zi) => {
      Array.from(zone.querySelectorAll<HTMLElement>(':scope > .cell')).forEach((cell, ci) => {
        const box = { left: ci * 110, right: ci * 110 + 100, top: zi * 200, bottom: zi * 200 + 100 }
        cell.getBoundingClientRect = () => ({ ...box, width: 100, height: 100 }) as DOMRect
        cell.querySelector<HTMLElement>('.tile')!.getBoundingClientRect = cell.getBoundingClientRect
      })
    })
    document.elementsFromPoint = (_x: number, y: number) => {
      const zone = zones[Math.floor(y / 200)]
      return zone ? [zone] : []
    }
    const c = tile('c') // in the tray (zone index 5)
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
    pointer('pointerdown', 50, 1050)
    pointer('pointermove', 52, 1052) // under the threshold
    expect(root.classList.contains('dragging')).toBe(false)
    pointer('pointermove', 150, 50) // tier S, right of Alpha
    expect(root.classList.contains('dragging')).toBe(true)
    expect(q('.ss-tierlist .ghost')).not.toBeNull()
    expect(q('[data-zone="S"]').classList.contains('target')).toBe(true)
    expect(zoneIds('S')).toEqual(['a', 'c', 'b'])
    expect(c.closest('.cell')?.classList.contains('shadow')).toBe(true)
    pointer('pointerup', 150, 50)
    expect(root.classList.contains('dragging')).toBe(false)
    expect(q('.ss-tierlist .ghost')).toBeNull()
    expect(seen).toEqual([{ placements: { S: ['a', 'c', 'b'], A: [], B: [], C: [], D: [] } }])
    expect(live()).toBe('Dropped Gamma in S, position 2 of 3.')
  })

  it('data-ss-readonly markup is inert', () => {
    const root = mountHtml(html({ readonly: true })).firstElementChild as HTMLElement
    expect(root.hasAttribute('data-ss-readonly')).toBe(true)
    expect(q('button.tile')).toBeNull()
    const seen: unknown[] = []
    root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
    key(q('.tile'), ' ')
    expect(seen).toEqual([])
  })

  it('has no axe violations', async () => {
    mountHtml(html())
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})

describe('vanilla — fields', () => {
  it('Input: the clear button empties, refocuses and hides; typing shows it again', () => {
    // `bind:value` sets the DOM property, which innerHTML drops; SSR (the docs snippets) emits
    // the attribute, so mirror that here.
    mountHtml(
      svelteHtml(Input, { label: 'Search', id: 'q', clearable: true, value: 'abc' }).replace(
        'class="ss-input"',
        'class="ss-input" value="abc"',
      ),
    )
    const input = q<HTMLInputElement>('.ss-input')
    const clear = q<HTMLButtonElement>('.clear')
    const inputs = vi.fn()
    input.addEventListener('input', inputs)
    expect(clear.hidden).toBe(false)
    click(clear)
    expect(input.value).toBe('')
    expect(clear.hidden).toBe(true)
    expect(document.activeElement).toBe(input)
    expect(inputs).toHaveBeenCalledTimes(1)
    input.value = 'x'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(clear.hidden).toBe(false)
  })

  it('NumberField: steppers nudge by step, clamp, and disable at the bounds', () => {
    mountHtml(
      svelteHtml(NumberField, { label: 'Qty', id: 'n', min: 0, max: 2, step: 1, value: 1 }).replace(
        'class="ss-input"',
        'class="ss-input" value="1"',
      ),
    )
    const input = q<HTMLInputElement>('.ss-input')
    const dec = q<HTMLButtonElement>('.step.dec')
    const inc = q<HTMLButtonElement>('.step.inc')
    const changes = vi.fn()
    input.addEventListener('change', changes)
    click(inc)
    expect(input.value).toBe('2')
    expect(inc.disabled).toBe(true)
    click(inc) // disabled: no-op
    expect(input.value).toBe('2')
    click(dec)
    click(dec)
    expect(input.value).toBe('0')
    expect(dec.disabled).toBe(true)
    expect(inc.disabled).toBe(false)
    expect(changes).toHaveBeenCalledTimes(3)
    input.value = ''
    click(inc) // empty → starts from min
    expect(input.value).toBe('1')
  })

  it('Textarea: autosize fallback syncs the height when field-sizing is unsupported', () => {
    mountHtml(svelteHtml(Textarea, { label: 'Notes', id: 't', autosize: true }))
    const ta = q<HTMLTextAreaElement>('.field.autosize')
    // jsdom has no CSS.supports → the JS fallback runs and writes an explicit height.
    expect(ta.style.height).toMatch(/px$/)
    ta.style.height = ''
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    expect(ta.style.height).toMatch(/px$/)
  })
})

describe('vanilla — icons', () => {
  function attrs(svg: Element): Record<string, string> {
    const out: Record<string, string> = {}
    for (const a of Array.from(svg.attributes)) out[a.name] = a.value
    delete out.class
    // jsdom normalises `style` only when set through the CSSOM (Svelte does) — compare the tokens.
    if (out.style) out.style = out.style.replace(/\s+/g, '').replace(/;$/, '')
    return out
  }

  it('iconSvg matches the Svelte Icon output attribute-for-attribute', () => {
    const { container, unmount } = render(Icon, { name: 'check', size: 'sm' })
    const ref = container.querySelector('svg')!
    const tpl = document.createElement('template')
    tpl.innerHTML = iconSvg('check', { size: 'sm' })
    const mine = tpl.content.firstElementChild!
    expect(attrs(mine)).toEqual(attrs(ref))
    expect(mine.innerHTML).toBe(ref.innerHTML)
    expect(mine.classList.contains('ss-icon')).toBe(true)
    unmount()
  })

  it('hydrates placeholders, carrying classes and data options over', () => {
    mountHtml(
      '<span data-ss-icon="chevron" class="ic" data-size="lg" data-rotate="90" data-spin></span>' +
        '<span data-ss-icon="target" data-title="Goal" data-variant="solid"></span>',
    )
    const [a, b] = qa<SVGElement & HTMLElement>('svg.ss-icon')
    expect(a.classList.contains('ic')).toBe(true)
    expect(a.classList.contains('spin')).toBe(true)
    expect(a.getAttribute('data-size-variant')).toBe('lg')
    expect(a.getAttribute('data-rotate')).toBe('90')
    expect(a.getAttribute('style')).toBe('width:24px;height:24px')
    expect(a.getAttribute('aria-hidden')).toBe('true')
    expect(a.innerHTML.replace(/\/>/g, '></path>')).toBe(PATHS.chevron.replace(/\/>/g, '></path>'))
    expect(b.getAttribute('role')).toBe('img')
    expect(b.getAttribute('fill')).toBe('currentColor')
    expect(b.querySelector('title')!.textContent).toBe('Goal')
    expect(b.getAttribute('aria-labelledby')).toBe(b.querySelector('title')!.id)
    expect(document.querySelector('[data-ss-icon]')).toBeNull()
  })

  it('warns and renders an empty glyph for unknown names; hydrateIcons is scoped to root', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    document.body.innerHTML =
      '<div id="a"><i data-ss-icon="nope"></i></div><i data-ss-icon="check"></i>'
    hydrateIcons(document.getElementById('a')!)
    expect(warn).toHaveBeenCalledOnce()
    expect(q('#a svg').innerHTML).toBe('')
    expect(document.querySelectorAll('[data-ss-icon]')).toHaveLength(1)
    warn.mockRestore()
  })
})
