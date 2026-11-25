import { describe, it, expect } from 'vitest'
import {
  tableAriaSort,
  tableColumnAlign,
  tableSortIndicator,
  tableSortRows,
  tableToggleSort,
} from '$lib/core/table'

describe('core/table — header press', () => {
  it('starts ascending on an unsorted table', () => {
    expect(tableToggleSort(undefined, 'name')).toEqual({ key: 'name', dir: 'asc' })
    expect(tableToggleSort(null, 'name')).toEqual({ key: 'name', dir: 'asc' })
  })

  it('flips the direction of the sorted column', () => {
    expect(tableToggleSort({ key: 'name', dir: 'asc' }, 'name')).toEqual({
      key: 'name',
      dir: 'desc',
    })
    expect(tableToggleSort({ key: 'name', dir: 'desc' }, 'name')).toEqual({
      key: 'name',
      dir: 'asc',
    })
  })

  it('starts ascending on a different column, whatever the old direction', () => {
    expect(tableToggleSort({ key: 'name', dir: 'desc' }, 'cpu')).toEqual({ key: 'cpu', dir: 'asc' })
    expect(tableToggleSort({ key: 'name', dir: 'asc' }, 'cpu')).toEqual({ key: 'cpu', dir: 'asc' })
  })

  it('returns a new object rather than mutating the sort', () => {
    const sort = { key: 'name', dir: 'asc' } as const
    expect(tableToggleSort(sort, 'name')).not.toBe(sort)
    expect(sort.dir).toBe('asc')
  })
})

describe('core/table — sort attributes', () => {
  it('reflects the sort as aria-sort', () => {
    expect(tableAriaSort(undefined, 'name')).toBe('none')
    expect(tableAriaSort({ key: 'cpu', dir: 'asc' }, 'name')).toBe('none')
    expect(tableAriaSort({ key: 'name', dir: 'asc' }, 'name')).toBe('ascending')
    expect(tableAriaSort({ key: 'name', dir: 'desc' }, 'name')).toBe('descending')
  })

  it('picks the indicator glyph', () => {
    expect(tableSortIndicator(undefined, 'name')).toBe('↕')
    expect(tableSortIndicator({ key: 'cpu', dir: 'asc' }, 'name')).toBe('↕')
    expect(tableSortIndicator({ key: 'name', dir: 'asc' }, 'name')).toBe('↑')
    expect(tableSortIndicator({ key: 'name', dir: 'desc' }, 'name')).toBe('↓')
  })
})

describe('core/table — row order', () => {
  const columns = [{ key: 'name' }, { key: 'cpu', numeric: true }]
  const rows = [
    { name: 'beta', cpu: 9 },
    { name: 'alpha', cpu: 100 },
    { name: 'gamma', cpu: 20 },
  ]
  const names = (out: readonly { name: string }[]) => out.map((r) => r.name)

  it('returns the same rows when there is no sort', () => {
    expect(tableSortRows(rows, columns, undefined)).toBe(rows)
  })

  it('returns the same rows when the sort names an unknown column', () => {
    expect(tableSortRows(rows, columns, { key: 'nope', dir: 'asc' })).toBe(rows)
  })

  it('sorts strings both ways', () => {
    expect(names(tableSortRows(rows, columns, { key: 'name', dir: 'asc' }))).toEqual([
      'alpha',
      'beta',
      'gamma',
    ])
    expect(names(tableSortRows(rows, columns, { key: 'name', dir: 'desc' }))).toEqual([
      'gamma',
      'beta',
      'alpha',
    ])
  })

  it('sorts numeric columns as numbers, not strings', () => {
    expect(names(tableSortRows(rows, columns, { key: 'cpu', dir: 'asc' }))).toEqual([
      'beta',
      'gamma',
      'alpha',
    ])
    expect(names(tableSortRows(rows, columns, { key: 'cpu', dir: 'desc' }))).toEqual([
      'alpha',
      'gamma',
      'beta',
    ])
  })

  it('sorts numeric strings numerically in a numeric column', () => {
    const data = [{ cpu: '10' }, { cpu: '9' }, { cpu: '100' }]
    expect(tableSortRows(data, columns, { key: 'cpu', dir: 'asc' }).map((r) => r.cpu)).toEqual([
      '9',
      '10',
      '100',
    ])
  })

  it('never mutates the input', () => {
    const before = [...rows]
    tableSortRows(rows, columns, { key: 'name', dir: 'asc' })
    expect(rows).toEqual(before)
  })

  it('treats nullish values and nullish rows as empty strings', () => {
    const data = [{ name: 'b' }, null, { name: undefined }, { name: 'a' }]
    const out = tableSortRows(data, columns, { key: 'name', dir: 'asc' })
    expect(out.slice(2)).toEqual([{ name: 'a' }, { name: 'b' }])
    expect(out.slice(0, 2)).toEqual([null, { name: undefined }])
  })
})

describe('core/table — alignment', () => {
  it('defaults to start, and to end for numeric columns', () => {
    expect(tableColumnAlign({})).toBe('start')
    expect(tableColumnAlign({ numeric: true })).toBe('end')
  })

  it('maps the legacy physical values to logical ones', () => {
    expect(tableColumnAlign({ align: 'left' })).toBe('start')
    expect(tableColumnAlign({ align: 'right' })).toBe('end')
  })

  it('keeps explicit logical values, which win over numeric', () => {
    expect(tableColumnAlign({ align: 'center' })).toBe('center')
    expect(tableColumnAlign({ align: 'start', numeric: true })).toBe('start')
    expect(tableColumnAlign({ align: 'end' })).toBe('end')
  })
})
