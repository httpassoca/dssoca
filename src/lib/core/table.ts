/**
 * Table core (DS-0197) — sorting: what a press on a sortable header does, the order of the rows
 * and the attributes that reflect the sort. Pure functions; Table.svelte holds the bound `sort`
 * and applies the result. No DOM, no Svelte.
 */

export type TableSortDir = 'asc' | 'desc'

/** The active sort: a column key and a direction. */
export interface TableSortState {
  key: string
  dir: TableSortDir
}

/** What the sort needs to know about a column. */
export interface TableSortColumn {
  key: string
  /** Compare the values as numbers rather than as strings. */
  numeric?: boolean
}

type Sort = TableSortState | undefined | null

const sortsBy = (sort: Sort, key: string): sort is TableSortState =>
  sort != null && sort.key === key

/** A sortable header was pressed: the same column flips direction, a new one starts ascending. */
export function tableToggleSort(sort: Sort, key: string): TableSortState {
  return sortsBy(sort, key)
    ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' }
    : { key, dir: 'asc' }
}

/** `aria-sort` of a sortable column header. */
export function tableAriaSort(sort: Sort, key: string): 'ascending' | 'descending' | 'none' {
  if (!sortsBy(sort, key)) return 'none'
  return sort.dir === 'asc' ? 'ascending' : 'descending'
}

/** The glyph in a sortable header: the active direction, or the "sortable" double arrow. */
export function tableSortIndicator(sort: Sort, key: string): '↑' | '↓' | '↕' {
  if (!sortsBy(sort, key)) return '↕'
  return sort.dir === 'asc' ? '↑' : '↓'
}

/**
 * The rows in display order. Returns `rows` itself when there is no sort or it names an unknown
 * column; otherwise a sorted copy (numeric columns compare as numbers, the rest as
 * locale-aware strings with nullish values as `''`).
 */
export function tableSortRows<Row>(
  rows: readonly Row[],
  columns: readonly TableSortColumn[],
  sort: Sort,
): readonly Row[] {
  if (!sort) return rows
  const col = columns.find((c) => c.key === sort.key)
  if (!col) return rows
  const dir = sort.dir === 'desc' ? -1 : 1
  const value = (row: Row): unknown =>
    (row as Record<string, unknown> | null | undefined)?.[sort.key]
  return [...rows].sort((a, b) => {
    const av = value(a)
    const bv = value(b)
    if (col.numeric) return (Number(av) - Number(bv)) * dir
    return String(av ?? '').localeCompare(String(bv ?? '')) * dir
  })
}

export type TableAlign = 'start' | 'end' | 'left' | 'right' | 'center'

/**
 * Logical alignment of a column: legacy `left` / `right` map to `start` / `end` so RTL mirrors,
 * and a numeric column defaults to `end`.
 */
export function tableColumnAlign(column: {
  align?: TableAlign
  numeric?: boolean
}): 'start' | 'end' | 'center' {
  const align = column.align ?? (column.numeric ? 'end' : 'start')
  if (align === 'left') return 'start'
  if (align === 'right') return 'end'
  return align
}
