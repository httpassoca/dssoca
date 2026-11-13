import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Heatmap from '$lib/components/Heatmap.svelte'

const gridcells = (c: Element) => [...c.querySelectorAll<SVGElement>('[role="gridcell"]')]

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

// 4×4 head-to-head wins; null diagonal (self).
const players = ['Ana', 'Bruno', 'Caio', 'Duda']
const values: (number | null)[][] = [
  [null, 5, 7, 9],
  [3, null, 6, 8],
  [2, 4, null, 5],
  [1, 2, 3, null],
]

describe('Heatmap — cells', () => {
  it('renders one value cell per non-null value', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cells = container.querySelectorAll('.ss-heatmap rect.cell:not(.cell-empty)')
    expect(cells).toHaveLength(12)
    expect(cells[0].getAttribute('aria-label')).toBe('Ana vs Bruno: 5')
  })

  it('renders the null diagonal as empty cells', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    expect(container.querySelectorAll('.ss-heatmap rect.cell-empty')).toHaveLength(4)
  })

  it('draws value text by default and hides it when showValues=false', () => {
    const shown = render(Heatmap, { rows: players, columns: players, values })
    expect(shown.container.querySelectorAll('.ss-heatmap .cell-text')).toHaveLength(12)
    const hidden = render(Heatmap, { rows: players, columns: players, values, showValues: false })
    expect(hidden.container.querySelectorAll('.ss-heatmap .cell-text')).toHaveLength(0)
  })
})

describe('Heatmap — headers', () => {
  it('renders row and column header texts', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cols = [...container.querySelectorAll('.ss-heatmap .header.col')].map(
      (n) => n.textContent,
    )
    const rowsTxt = [...container.querySelectorAll('.ss-heatmap .header.row')].map(
      (n) => n.textContent,
    )
    expect(cols).toContain('Ana')
    expect(cols).toContain('Duda')
    expect(rowsTxt).toContain('Bruno')
    expect(rowsTxt).toContain('Caio')
  })
})

describe('Heatmap — grid semantics + roving tabindex (DS-0164)', () => {
  it('exposes role=grid > row > gridcell (no role=button marks)', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const grid = container.querySelector('[role="grid"]')!
    const rows = grid.querySelectorAll(':scope > [role="row"]')
    expect(rows).toHaveLength(4)
    rows.forEach((row) => expect(row.querySelectorAll('[role="gridcell"]')).toHaveLength(4))
    expect(container.querySelector('[role="button"]')).toBeNull()
    expect(gridcells(container)[0].getAttribute('aria-label')).toBe('Ana vs Ana: no value')
  })

  it('is a single tab stop (first cell by default)', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cells = gridcells(container)
    expect(cells.filter((c) => c.getAttribute('tabindex') === '0')).toHaveLength(1)
    expect(cells[0]).toHaveAttribute('tabindex', '0')
    expect(cells.slice(1).every((c) => c.getAttribute('tabindex') === '-1')).toBe(true)
  })

  it('moves focus in 2-D with the arrow keys and Home/End, and roves the tab stop', async () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cells = gridcells(container)
    cells[0].focus()
    await fireEvent.keyDown(cells[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(cells[1])
    await fireEvent.keyDown(cells[1], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(cells[5])
    expect(cells[5]).toHaveAttribute('tabindex', '0')
    expect(cells[0]).toHaveAttribute('tabindex', '-1')
    await fireEvent.keyDown(cells[5], { key: 'End' })
    expect(document.activeElement).toBe(cells[15])
    await fireEvent.keyDown(cells[15], { key: 'ArrowDown' }) // clamps at the bottom edge
    expect(document.activeElement).toBe(cells[15])
    await fireEvent.keyDown(cells[15], { key: 'Home' })
    expect(document.activeElement).toBe(cells[0])
  })

  it('prevents default scrolling only for navigation keys', async () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cell = gridcells(container)[0]
    expect(await fireEvent.keyDown(cell, { key: 'ArrowRight' })).toBe(false)
    expect(await fireEvent.keyDown(cell, { key: 'a' })).toBe(true)
  })

  it('hides the value text from the accessibility tree', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const texts = [...container.querySelectorAll('.ss-heatmap .cell-text')]
    expect(texts.length).toBeGreaterThan(0)
    expect(texts.every((t) => t.getAttribute('aria-hidden') === 'true')).toBe(true)
  })
})

describe('Heatmap — legend', () => {
  it('renders a min→max legend when values are not printed', () => {
    const { container } = render(Heatmap, {
      rows: players,
      columns: players,
      values,
      showValues: false,
    })
    const legend = container.querySelector('.ss-heatmap .legend')!
    expect(legend).not.toBeNull()
    const vals = [...legend.querySelectorAll('.legend-val')].map((n) => n.textContent)
    expect(vals).toEqual(['1', '9'])
    expect(legend.querySelectorAll('.legend-step').length).toBeGreaterThan(1)
  })

  it('omits the legend when values are printed', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    expect(container.querySelector('.ss-heatmap .legend')).toBeNull()
  })
})

describe('Heatmap — tooltip', () => {
  it('is aria-hidden (not a live region) and hides on Escape', async () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cell = gridcells(container)[1]
    await fireEvent.focus(cell)
    const tip = container.querySelector('.ss-heatmap .tooltip')!
    expect(tip).toHaveAttribute('aria-hidden', 'true')
    expect(tip).not.toHaveAttribute('role')
    await fireEvent.keyDown(cell, { key: 'Escape' })
    expect(container.querySelector('.ss-heatmap .tooltip')).toBeNull()
  })

  it('hides a hover-opened tooltip on Escape even when focus is elsewhere', async () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cell = gridcells(container)[2]
    await fireEvent.mouseEnter(cell)
    expect(container.querySelector('.ss-heatmap .tooltip')).not.toBeNull()
    await fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(container.querySelector('.ss-heatmap .tooltip')).toBeNull()
  })

  it('reveals tooltip text on focusing a cell and hides it on blur', async () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    expect(container.querySelector('.ss-heatmap .tooltip')).toBeNull()
    const cell = container.querySelector('.ss-heatmap rect.cell:not(.cell-empty)')!
    await fireEvent.focus(cell)
    expect(container.querySelector('.ss-heatmap .tooltip')!.textContent).toContain('Ana')
    await fireEvent.blur(cell)
    expect(container.querySelector('.ss-heatmap .tooltip')).toBeNull()
  })
})

describe('Heatmap — empty state', () => {
  it('renders an em-dash placeholder and a "No data" name', () => {
    const { container } = render(Heatmap, { rows: [], columns: [], values: [] })
    expect(container.querySelector('.ss-heatmap .empty')).toHaveTextContent('—')
    expect(container.querySelector('.ss-heatmap')).toHaveAttribute('aria-label', 'No data')
    expect(container.querySelector('.ss-heatmap rect.cell')).toBeNull()
  })
})

describe('Heatmap — accessibility', () => {
  it('exposes role="group" and an auto-generated aria-label', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const root = container.querySelector('.ss-heatmap')!
    expect(root).toHaveAttribute('role', 'group')
    expect(root.getAttribute('aria-label')).toContain('Heatmap')
  })

  it('lets an explicit summary override the auto text', () => {
    const { container } = render(Heatmap, {
      rows: players,
      columns: players,
      values,
      summary: 'Head-to-head wins',
    })
    expect(container.querySelector('.ss-heatmap')).toHaveAttribute(
      'aria-label',
      'Head-to-head wins',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations with the legend (showValues=false)', async () => {
    const { container } = render(Heatmap, {
      rows: players,
      columns: players,
      values,
      showValues: false,
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(Heatmap, { rows: [], columns: [], values: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
