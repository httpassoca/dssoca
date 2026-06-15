import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { axe } from 'vitest-axe'
import Table from '$lib/components/Table.svelte'
import type { TableColumn } from '$lib/components/Table.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const columns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'score', label: 'Score', numeric: true, sortable: true },
]

const rows = [
  { name: 'Charlie', score: 30 },
  { name: 'Alice', score: 10 },
  { name: 'Bob', score: 20 },
]

const firstCell = (container: HTMLElement) => container.querySelector<HTMLElement>('tbody tr td')!

describe('Table — rendering', () => {
  it('renders a header cell per column', () => {
    const { container } = render(Table, { columns, rows })
    const heads = container.querySelectorAll('thead th')
    expect(heads).toHaveLength(2)
    expect(heads[0]).toHaveTextContent('Name')
    expect(heads[1]).toHaveTextContent('Score')
  })

  it('renders a row per data item with cell values', () => {
    const { container } = render(Table, { columns, rows })
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
    const firstRowCells = container.querySelectorAll('tbody tr:first-child td')
    expect(firstRowCells[0]).toHaveTextContent('Charlie')
    expect(firstRowCells[1]).toHaveTextContent('30')
  })

  it('applies a column format function to cell values', () => {
    const cols: TableColumn[] = [{ key: 'score', label: 'Score', format: (v) => `$${v}.00` }]
    const { container } = render(Table, { columns: cols, rows: [{ score: 42 }] })
    expect(firstCell(container)).toHaveTextContent('$42.00')
  })

  it('renders a custom cell snippet with the row', () => {
    const badge = createRawSnippet((row: () => { name: string }) => ({
      render: () => `<span class="custom-cell">${row().name}!</span>`,
    }))
    const cols: TableColumn[] = [{ key: 'name', label: 'Name', cell: badge }]
    const { container } = render(Table, { columns: cols, rows: [{ name: 'Alice' }] })
    const custom = container.querySelector('.custom-cell')
    expect(custom).not.toBeNull()
    expect(custom).toHaveTextContent('Alice!')
  })
})

describe('Table — sorting', () => {
  it('sortable header renders a button; non-sortable does not', () => {
    const cols: TableColumn[] = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'note', label: 'Note' },
    ]
    const { container } = render(Table, { columns: cols, rows })
    const heads = container.querySelectorAll('thead th')
    expect(heads[0].querySelector('button')).not.toBeNull()
    expect(heads[1].querySelector('button')).toBeNull()
  })

  it('clicking a sortable header sets aria-sort and reorders rows', async () => {
    const { container } = render(Table, { columns, rows })
    expect(firstCell(container)).toHaveTextContent('Charlie')
    const btn = container.querySelector<HTMLButtonElement>('thead th .sort')!
    await fireEvent.click(btn)
    const th = container.querySelector('thead th')!
    expect(th).toHaveAttribute('aria-sort', 'ascending')
    expect(firstCell(container)).toHaveTextContent('Alice')
  })

  it('clicking a sorted header toggles to descending', async () => {
    const { container } = render(Table, { columns, rows })
    const btn = container.querySelector<HTMLButtonElement>('thead th .sort')!
    await fireEvent.click(btn) // asc
    await fireEvent.click(btn) // desc
    const th = container.querySelector('thead th')!
    expect(th).toHaveAttribute('aria-sort', 'descending')
    expect(firstCell(container)).toHaveTextContent('Charlie')
  })

  it('sorts numeric columns numerically (not lexically)', async () => {
    const numRows = [{ score: 100 }, { score: 9 }, { score: 20 }]
    const cols: TableColumn[] = [{ key: 'score', label: 'Score', numeric: true, sortable: true }]
    const { container } = render(Table, { columns: cols, rows: numRows })
    await fireEvent.click(container.querySelector<HTMLButtonElement>('.sort')!)
    const cells = container.querySelectorAll('tbody td')
    expect(cells[0]).toHaveTextContent('9')
    expect(cells[1]).toHaveTextContent('20')
    expect(cells[2]).toHaveTextContent('100')
  })

  it('non-sortable header carries no aria-sort', () => {
    const cols: TableColumn[] = [{ key: 'name', label: 'Name' }]
    const { container } = render(Table, { columns: cols, rows })
    expect(container.querySelector('thead th')).not.toHaveAttribute('aria-sort')
  })
})

describe('Table — numeric alignment', () => {
  it('right-aligns numeric columns via data-align and adds the numeric class', () => {
    const { container } = render(Table, { columns, rows })
    const numericCell = container.querySelectorAll('tbody tr:first-child td')[1]
    expect(numericCell).toHaveClass('numeric')
    expect(numericCell).toHaveAttribute('data-align', 'right')
    const numericHead = container.querySelectorAll('thead th')[1]
    expect(numericHead).toHaveAttribute('data-align', 'right')
  })
})

describe('Table — empty state', () => {
  it('renders a default "No data" cell spanning all columns when rows is empty', () => {
    const { container } = render(Table, { columns, rows: [] })
    const cell = container.querySelector('tbody td.empty')!
    expect(cell).toHaveTextContent('No data')
    expect(cell).toHaveAttribute('colspan', '2')
  })

  it('renders the empty snippet when provided', () => {
    const empty = createRawSnippet(() => ({
      render: () => '<span class="no-rows">Nothing here</span>',
    }))
    const { container } = render(Table, { columns, rows: [], empty })
    expect(container.querySelector('.no-rows')).not.toBeNull()
    expect(container.querySelector('tbody td.empty')).toHaveTextContent('Nothing here')
  })
})

describe('Table — caption + size', () => {
  it('renders a caption when provided', () => {
    const { container } = render(Table, { columns, rows, caption: 'Leaderboard' })
    expect(container.querySelector('caption')).toHaveTextContent('Leaderboard')
  })

  it('reflects an explicit size on the root as data-size-variant', () => {
    const { container } = render(Table, { columns, rows, size: 'lg' })
    expect(container.querySelector('.ss-table')).toHaveAttribute('data-size-variant', 'lg')
  })
})

describe('Table — accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(Table, { columns, rows, caption: 'Players' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations when empty', async () => {
    const { container } = render(Table, { columns, rows: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
