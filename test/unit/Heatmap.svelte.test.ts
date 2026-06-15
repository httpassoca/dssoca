import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Heatmap from '$lib/components/Heatmap.svelte'

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
  it('renders one focusable cell per non-null value', () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    const cells = container.querySelectorAll('.ss-heatmap rect.cell:not(.cell-empty)')
    expect(cells).toHaveLength(12)
    expect(cells[0]).toHaveAttribute('tabindex', '0')
    expect(cells[0].getAttribute('aria-label')).toContain('Ana')
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
    const cols = [...container.querySelectorAll('.ss-heatmap .header.col')].map((n) => n.textContent)
    const rowsTxt = [...container.querySelectorAll('.ss-heatmap .header.row')].map(
      (n) => n.textContent,
    )
    expect(cols).toContain('Ana')
    expect(cols).toContain('Duda')
    expect(rowsTxt).toContain('Bruno')
    expect(rowsTxt).toContain('Caio')
  })
})

describe('Heatmap — tooltip', () => {
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
    expect(container.querySelector('.ss-heatmap')).toHaveAttribute('aria-label', 'Head-to-head wins')
  })

  it('has no axe violations', async () => {
    const { container } = render(Heatmap, { rows: players, columns: players, values })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(Heatmap, { rows: [], columns: [], values: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
