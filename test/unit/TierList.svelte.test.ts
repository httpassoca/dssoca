import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import { axe } from 'vitest-axe'
import TierListHarness from '../harness/TierListHarness.svelte'
import { TRAY } from '$lib/tierlist-core'

// DS-0159 — TierList: rows + tray, tiles, keyboard sorting, pointer drag, placements out.
// The pure maths lives in tierlist-core.test.ts; these pin the component contract.

const axeOpts = { rules: { 'color-contrast': { enabled: false } } }

const zoneIds = (container: HTMLElement, zone: string): string[] =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      zone === TRAY ? '[data-zone][data-tray] .tile' : `[data-zone="${zone}"] .tile`,
    ),
  ).map((t) => t.dataset.item as string)

const tile = (container: HTMLElement, id: string) =>
  container.querySelector<HTMLButtonElement>(`.tile[data-item="${id}"]`)!

const key = (el: Element, k: string) => fireEvent.keyDown(el, { key: k })
// The blur cancel is decided a macrotask later (see onTileBlur), once focus has really moved.
const settle = () => new Promise<void>((r) => setTimeout(r, 0))
const live = (container: HTMLElement) => container.querySelector('.live')!.textContent?.trim() ?? ''

afterEach(() => vi.restoreAllMocks())

describe('TierList — rendering', () => {
  it('renders the default five tiers, the tray, and one tile per item', () => {
    const { container } = render(TierListHarness)
    const root = container.querySelector('.ss-tierlist')!
    expect(root).toHaveAttribute('role', 'group')
    expect(root).toHaveAttribute('aria-label', 'Tier list')
    expect(Array.from(container.querySelectorAll('.letter')).map((l) => l.textContent)).toEqual([
      'S',
      'A',
      'B',
      'C',
      'D',
    ])
    expect(container.querySelector('.tray-label')).toHaveTextContent('Unranked')
    expect(zoneIds(container, TRAY)).toEqual(['alpha', 'beta', 'gamma', 'delta'])
    expect(container.querySelectorAll('.tile')).toHaveLength(4)
  })

  it('places items per `placements` and labels each zone', () => {
    const { container } = render(TierListHarness, {
      placements: { S: ['gamma'], B: ['alpha', 'delta'] },
    })
    expect(zoneIds(container, 'S')).toEqual(['gamma'])
    expect(zoneIds(container, 'B')).toEqual(['alpha', 'delta'])
    expect(zoneIds(container, TRAY)).toEqual(['beta'])
    expect(container.querySelector('[data-zone="S"]')).toHaveAttribute('aria-label', 'S')
    expect(container.querySelector('[data-tray]')).toHaveAttribute('aria-label', 'Unranked')
  })

  it('tiles are buttons named after the item, with instructions and a pressed state', () => {
    const { container } = render(TierListHarness)
    const t = tile(container, 'alpha')
    expect(t.tagName).toBe('BUTTON')
    expect(t).toHaveAttribute('aria-label', 'Alpha')
    expect(t).toHaveAttribute('aria-pressed', 'false')
    expect(t).toHaveAttribute('aria-roledescription', 'draggable tile')
    const hint = container.querySelector(`#${t.getAttribute('aria-describedby')}`)!
    expect(hint).toHaveTextContent(/Press Space to pick up the tile/)
    expect(t.querySelector('.name')).toHaveTextContent('Alpha')
  })

  it('renders the custom tile snippet per item', () => {
    const { container } = render(TierListHarness, { customTile: true })
    expect(container.querySelectorAll('.custom-tile')).toHaveLength(4)
    expect(container.querySelector('.custom-tile[data-for="beta"]')).toHaveTextContent('★ Beta')
    expect(container.querySelector('.name')).toBeNull()
  })

  it('custom tiers, colours and no tray', () => {
    const { container } = render(TierListHarness, {
      tiers: [
        { id: 'top', label: 'Top', color: 'var(--ss-blue)' },
        { id: 'rest', label: 'Rest' },
      ],
      placements: { top: ['alpha'], rest: ['beta', 'gamma', 'delta'] },
      tray: false,
      label: 'Favourites',
    })
    expect(container.querySelector('.ss-tierlist')).toHaveAttribute('aria-label', 'Favourites')
    expect(container.querySelector('[data-tray]')).toBeNull()
    const rows = container.querySelectorAll<HTMLElement>('.row')
    expect(rows).toHaveLength(2)
    expect(rows[0].style.getPropertyValue('--ss-tier-color')).toBe('var(--ss-blue)')
    expect(rows[1].style.getPropertyValue('--ss-tier-color')).toBe('var(--ss-cyan)')
  })

  it('readonly renders plain tiles (no buttons, no live region, data-ss-readonly)', () => {
    const { container } = render(TierListHarness, { readonly: true })
    expect(container.querySelector('.ss-tierlist')).toHaveAttribute('data-ss-readonly')
    expect(container.querySelector('button.tile')).toBeNull()
    expect(container.querySelectorAll('div.tile')).toHaveLength(4)
    expect(container.querySelector('.live')).toBeNull()
  })

  it('writes the per-instance size and inherits when unset', () => {
    expect(
      render(TierListHarness, { size: 'lg' }).container.querySelector('.ss-tierlist'),
    ).toHaveAttribute('data-size-variant', 'lg')
    expect(render(TierListHarness).container.querySelector('.ss-tierlist')).not.toHaveAttribute(
      'data-size-variant',
    )
  })
})

describe('TierList — keyboard sorting', () => {
  it('Space picks up, arrows move within and across rows, Space drops and reports', async () => {
    const onchange = vi.fn()
    const { container } = render(TierListHarness, {
      placements: { S: ['alpha', 'beta'] },
      onchange,
    })
    const t = tile(container, 'alpha')
    t.focus()
    await key(t, ' ')
    expect(t).toHaveAttribute('aria-pressed', 'true')
    expect(t.closest('.cell')).toHaveClass('grabbed')
    expect(live(container)).toBe(
      'Picked up Alpha, S, position 1 of 2. Use the arrow keys to move it, Space to drop, Escape to cancel.',
    )
    expect(onchange).not.toHaveBeenCalled()

    await key(t, 'ArrowRight')
    expect(zoneIds(container, 'S')).toEqual(['beta', 'alpha'])
    expect(live(container)).toBe('Alpha moved to S, position 2 of 2.')

    await key(t, 'ArrowRight') // already last: nothing happens
    expect(zoneIds(container, 'S')).toEqual(['beta', 'alpha'])

    await key(t, 'ArrowDown')
    expect(zoneIds(container, 'A')).toEqual(['alpha'])
    expect(live(container)).toBe('Alpha moved to A, position 1 of 1.')
    // the tile is re-created in the other row's keyed block; focus follows it
    await tick()
    expect(document.activeElement).toBe(tile(container, 'alpha'))
    expect(tile(container, 'alpha')).toHaveAttribute('aria-pressed', 'true')

    await key(tile(container, 'alpha'), ' ')
    expect(tile(container, 'alpha')).toHaveAttribute('aria-pressed', 'false')
    expect(live(container)).toBe('Dropped Alpha in A, position 1 of 1.')
    expect(onchange).toHaveBeenCalledTimes(1)
    expect(onchange).toHaveBeenLastCalledWith({ S: ['beta'], A: ['alpha'], B: [], C: [], D: [] })
  })

  it('Escape restores the origin and announces it; blur cancels too', async () => {
    const onchange = vi.fn()
    const { container } = render(TierListHarness, { placements: { S: ['alpha'] }, onchange })
    const t = tile(container, 'alpha')
    t.focus()
    await key(t, ' ')
    await key(t, 'ArrowDown')
    await tick()
    expect(zoneIds(container, 'A')).toEqual(['alpha'])
    await key(tile(container, 'alpha'), 'Escape')
    expect(zoneIds(container, 'S')).toEqual(['alpha'])
    expect(zoneIds(container, 'A')).toEqual([])
    expect(live(container)).toBe('Cancelled. Alpha returned to S, position 1 of 1.')
    expect(onchange).not.toHaveBeenCalled()

    await tick()
    tile(container, 'alpha').focus()
    await key(tile(container, 'alpha'), ' ')
    await key(tile(container, 'alpha'), 'ArrowDown')
    await tick()
    await settle() // the cross-row refocus has landed; the grab is still live
    expect(tile(container, 'alpha')).toHaveAttribute('aria-pressed', 'true')
    tile(container, 'alpha').blur()
    await settle()
    expect(zoneIds(container, 'S')).toEqual(['alpha'])
    expect(tile(container, 'alpha')).toHaveAttribute('aria-pressed', 'false')
    expect(onchange).not.toHaveBeenCalled()
  })

  it('Home/End jump within the row; up from the tray lands in the last tier', async () => {
    const { container } = render(TierListHarness)
    const t = tile(container, 'delta')
    t.focus()
    await key(t, ' ')
    await key(t, 'Home')
    expect(zoneIds(container, TRAY)).toEqual(['delta', 'alpha', 'beta', 'gamma'])
    await key(tile(container, 'delta'), 'End')
    expect(zoneIds(container, TRAY)).toEqual(['alpha', 'beta', 'gamma', 'delta'])
    await key(tile(container, 'delta'), 'ArrowUp')
    await tick()
    expect(zoneIds(container, 'D')).toEqual(['delta'])
    expect(document.activeElement).toBe(tile(container, 'delta'))
  })

  it('dropping without a move reports nothing', async () => {
    const onchange = vi.fn()
    const { container } = render(TierListHarness, { onchange })
    const t = tile(container, 'alpha')
    await key(t, ' ')
    await key(t, ' ')
    expect(onchange).not.toHaveBeenCalled()
    expect(live(container)).toMatch(/^Dropped Alpha/)
  })

  it('keeps a bound `placements` in sync', async () => {
    const { container, getByTestId } = render(TierListHarness, { placements: { S: ['alpha'] } })
    const t = tile(container, 'alpha')
    await key(t, ' ')
    await key(t, 'ArrowDown')
    await tick()
    await key(tile(container, 'alpha'), ' ')
    await tick()
    expect(JSON.parse(getByTestId('placements').textContent ?? 'null')).toEqual({
      S: [],
      A: ['alpha'],
      B: [],
      C: [],
      D: [],
    })
  })

  it('unmanaged: works without placements/onchange and keeps its own order', async () => {
    const { container } = render(TierListHarness)
    const t = tile(container, 'beta')
    await key(t, ' ')
    await key(t, 'ArrowUp')
    await tick()
    await key(tile(container, 'beta'), ' ')
    expect(zoneIds(container, 'D')).toEqual(['beta'])
    expect(zoneIds(container, TRAY)).toEqual(['alpha', 'gamma', 'delta'])
  })

  it('Enter activates onselect when given (Space still sorts); otherwise Enter sorts', async () => {
    const onselect = vi.fn()
    const { container } = render(TierListHarness, { onselect })
    const t = tile(container, 'alpha')
    expect(t).toHaveAttribute('data-ss-activate')
    await key(t, 'Enter')
    expect(onselect).toHaveBeenCalledWith({ id: 'alpha', label: 'Alpha' })
    expect(t).toHaveAttribute('aria-pressed', 'false')
    await key(t, ' ')
    expect(t).toHaveAttribute('aria-pressed', 'true')

    const plain = render(TierListHarness)
    const p = tile(plain.container, 'alpha')
    expect(p).not.toHaveAttribute('data-ss-activate')
    await key(p, 'Enter')
    expect(p).toHaveAttribute('aria-pressed', 'true')
  })

  it('a click (no drag) activates onselect', async () => {
    const onselect = vi.fn()
    const { container } = render(TierListHarness, { onselect })
    await fireEvent.click(tile(container, 'beta'))
    expect(onselect).toHaveBeenCalledWith({ id: 'beta', label: 'Beta' })
  })
})

describe('TierList — pointer drag', () => {
  /** Lay the zones out as one row each (y = 0, 200, 400 …), tiles 100px wide, and make
   *  `elementsFromPoint` return the zone under the pointer, since jsdom has no layout. */
  function layout(container: HTMLElement) {
    const zones = Array.from(container.querySelectorAll<HTMLElement>('[data-zone]'))
    zones.forEach((zone, zi) => {
      const top = zi * 200
      zone.getBoundingClientRect = () =>
        ({ left: 0, right: 1000, top, bottom: top + 150, width: 1000, height: 150 }) as DOMRect
      Array.from(zone.querySelectorAll<HTMLElement>(':scope > .cell')).forEach((cell, ci) => {
        const left = ci * 110
        const box = { left, right: left + 100, top: top + 10, bottom: top + 110 }
        cell.getBoundingClientRect = () => ({ ...box, width: 100, height: 100 }) as DOMRect
        const t = cell.querySelector<HTMLElement>('.tile')!
        t.getBoundingClientRect = cell.getBoundingClientRect
      })
    })
    document.elementsFromPoint = (_x: number, y: number) => {
      const zone = zones[Math.floor(y / 200)]
      return zone ? [zone] : []
    }
  }

  it('drags a tile from the tray into a tier, previewing live and committing on release', async () => {
    const onchange = vi.fn()
    const onselect = vi.fn()
    const { container } = render(TierListHarness, {
      placements: { S: ['alpha'] },
      onchange,
      onselect,
    })
    layout(container)
    const t = tile(container, 'beta') // tray is zone index 5 → y ≈ 1000
    await fireEvent.pointerDown(t, { button: 0, clientX: 50, clientY: 1050, pointerId: 1 })
    // below the threshold: nothing yet
    await fireEvent.pointerMove(t, { clientX: 52, clientY: 1051 })
    expect(container.querySelector('.ghost')).toBeNull()
    // over tier S, right of alpha
    await fireEvent.pointerMove(t, { clientX: 150, clientY: 50 })
    expect(container.querySelector('.ss-tierlist')).toHaveClass('dragging')
    expect(container.querySelector('.ghost')).not.toBeNull()
    expect(container.querySelector('[data-zone="S"]')).toHaveClass('target')
    expect(zoneIds(container, 'S')).toEqual(['alpha', 'beta'])
    expect(tile(container, 'beta').closest('.cell')).toHaveClass('shadow')
    expect(onchange).not.toHaveBeenCalled()
    // drop
    await fireEvent.pointerUp(tile(container, 'beta'))
    expect(container.querySelector('.ghost')).toBeNull()
    expect(container.querySelector('.ss-tierlist')).not.toHaveClass('dragging')
    expect(onchange).toHaveBeenCalledWith({ S: ['alpha', 'beta'], A: [], B: [], C: [], D: [] })
    expect(live(container)).toBe('Dropped Beta in S, position 2 of 2.')
    // the drop's synthetic click is swallowed; a later real click still activates
    await fireEvent.click(tile(container, 'beta'))
    expect(onselect).not.toHaveBeenCalled()
    await fireEvent.click(tile(container, 'beta'))
    expect(onselect).toHaveBeenCalledWith({ id: 'beta', label: 'Beta' })
  })

  it('reorders within a row by pointer position', async () => {
    const onchange = vi.fn()
    const { container } = render(TierListHarness, {
      placements: { S: ['alpha', 'beta', 'gamma'] },
      onchange,
    })
    layout(container)
    const t = tile(container, 'gamma')
    await fireEvent.pointerDown(t, { button: 0, clientX: 270, clientY: 50, pointerId: 1 })
    await fireEvent.pointerMove(t, { clientX: 20, clientY: 60 }) // left of alpha's centre
    expect(zoneIds(container, 'S')).toEqual(['gamma', 'alpha', 'beta'])
    await fireEvent.pointerUp(tile(container, 'gamma'))
    expect(onchange).toHaveBeenLastCalledWith({
      S: ['gamma', 'alpha', 'beta'],
      A: [],
      B: [],
      C: [],
      D: [],
    })
  })

  it('pointercancel restores the origin; a release without movement changes nothing', async () => {
    const onchange = vi.fn()
    const { container } = render(TierListHarness, { placements: { S: ['alpha'] }, onchange })
    layout(container)
    const t = tile(container, 'beta')
    await fireEvent.pointerDown(t, { button: 0, clientX: 50, clientY: 1050, pointerId: 1 })
    await fireEvent.pointerMove(t, { clientX: 150, clientY: 50 })
    expect(zoneIds(container, 'S')).toEqual(['alpha', 'beta'])
    await fireEvent.pointerCancel(tile(container, 'beta'))
    expect(zoneIds(container, 'S')).toEqual(['alpha'])
    expect(zoneIds(container, TRAY)).toContain('beta')
    expect(onchange).not.toHaveBeenCalled()

    await fireEvent.pointerDown(t, { button: 0, clientX: 50, clientY: 1050, pointerId: 1 })
    await fireEvent.pointerUp(t)
    expect(onchange).not.toHaveBeenCalled()
  })

  it('readonly and secondary buttons never start a drag', async () => {
    const ro = render(TierListHarness, { readonly: true })
    layout(ro.container)
    const d = ro.container.querySelector<HTMLElement>('.tile[data-item="alpha"]')!
    await fireEvent.pointerDown(d, { button: 0, clientX: 50, clientY: 1050, pointerId: 1 })
    await fireEvent.pointerMove(d, { clientX: 150, clientY: 50 })
    expect(ro.container.querySelector('.ghost')).toBeNull()

    const { container } = render(TierListHarness)
    layout(container)
    const t = tile(container, 'alpha')
    await fireEvent.pointerDown(t, { button: 2, clientX: 50, clientY: 1050, pointerId: 1 })
    await fireEvent.pointerMove(t, { clientX: 150, clientY: 50 })
    expect(container.querySelector('.ghost')).toBeNull()
  })
})

describe('TierList — props sync', () => {
  it('re-derives from new placements and drops items that disappear', async () => {
    const { container, rerender } = render(TierListHarness, { placements: { S: ['alpha'] } })
    await rerender({ placements: { A: ['beta'] } })
    expect(zoneIds(container, 'S')).toEqual([])
    expect(zoneIds(container, 'A')).toEqual(['beta'])
    await rerender({ placements: { A: ['beta'] }, items: [{ id: 'beta', label: 'Beta' }] })
    expect(container.querySelectorAll('.tile')).toHaveLength(1)
  })
})

describe('TierList — a11y', () => {
  it('has no axe violations (interactive and readonly)', async () => {
    const a = render(TierListHarness, { placements: { S: ['alpha'], B: ['beta'] } })
    expect(await axe(a.container, axeOpts)).toHaveNoViolations()
    const b = render(TierListHarness, { readonly: true, customTile: true })
    expect(await axe(b.container, axeOpts)).toHaveNoViolations()
  })
})
