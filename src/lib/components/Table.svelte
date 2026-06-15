<script module lang="ts">
  import type { Snippet } from 'svelte'

  /**
   * A single table row passed to consumer callbacks and cell snippets. Typed as
   * `any` so consumers can narrow the row shape in their own `format`, `cell`,
   * and `getRowKey` definitions (Svelte `Snippet` params are contravariant, so
   * a stricter row type here would reject narrowly-typed consumer snippets).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TableRow = any

  /** One column definition for a {@link Table}. */
  export interface TableColumn {
    /** Key into each row object — also the cell's value source. */
    key: string
    /** Header text. */
    label: string
    /** Text alignment of the body cells. Numeric columns default to `right`. */
    align?: 'left' | 'right' | 'center'
    /** Allow clicking the header to sort by this column. */
    sortable?: boolean
    /** Treat values as numbers — right-aligns, uses the mono font, sorts numerically. */
    numeric?: boolean
    /** Format the raw value for display (receives the value and the whole row). */
    format?: (value: TableRow, row: TableRow) => string
    /** Custom cell content as a Svelte 5 snippet — receives the row. */
    cell?: Snippet<[TableRow]>
  }

  /** Current sort state for a {@link Table}. */
  export interface TableSort {
    key: string
    dir: 'asc' | 'desc'
  }
</script>

<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Column definitions. */
    columns: TableColumn[]
    /** Row data; each row is an arbitrary object keyed by column `key`. */
    rows: TableRow[]
    /** Active sort ($bindable). Clicking a sortable header toggles asc/desc. */
    sort?: TableSort
    /** Notified when the sort changes (in addition to updating the bound `sort`). */
    onsort?: (s: TableSort) => void
    /** Optional table caption; rendered subtly above the grid. */
    caption?: string
    /** Content shown when `rows` is empty (replaces the default "No data" row). */
    empty?: Snippet
    /** Stable key per row for keyed iteration. Defaults to the row index. */
    getRowKey?: (row: TableRow, i: number) => string | number
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let {
    columns,
    rows,
    sort = $bindable(),
    onsort,
    caption,
    empty,
    getRowKey,
    size,
  }: Props = $props()

  const resolvedSize = $derived(resolveComponentSize('Table', size))

  // Sorted view: only sort when an active sort targets a known column.
  const sortedRows = $derived.by(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort!.key)
    if (!col) return rows
    const dir = sort.dir === 'desc' ? -1 : 1
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a?.[sort!.key]
      const bv = b?.[sort!.key]
      if (col.numeric) return (Number(av) - Number(bv)) * dir
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir
    })
    return copy
  })

  function ariaSort(key: string): 'ascending' | 'descending' | 'none' {
    if (!sort || sort.key !== key) return 'none'
    return sort.dir === 'asc' ? 'ascending' : 'descending'
  }

  function toggleSort(key: string) {
    // Same column → flip direction; new column → start ascending.
    const next: TableSort =
      sort && sort.key === key
        ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    sort = next
    onsort?.(next)
  }

  function display(col: TableColumn, row: TableRow): string {
    const value = row?.[col.key]
    return col.format ? col.format(value, row) : String(value ?? '')
  }

  function colAlign(col: TableColumn): 'left' | 'right' | 'center' {
    return col.align ?? (col.numeric ? 'right' : 'left')
  }

  const isEmpty = $derived(rows.length === 0)
</script>

<table class="ss-table" data-size-variant={resolvedSize}>
  {#if caption}<caption>{caption}</caption>{/if}
  <thead>
    <tr>
      {#each columns as col (col.key)}
        <th
          scope="col"
          class="head"
          class:numeric={col.numeric}
          data-align={colAlign(col)}
          aria-sort={col.sortable ? ariaSort(col.key) : undefined}
        >
          {#if col.sortable}
            <button type="button" class="sort" onclick={() => toggleSort(col.key)}>
              <span class="label">{col.label}</span>
              <span class="indicator" aria-hidden="true">
                {#if sort && sort.key === col.key}{sort.dir === 'asc' ? '↑' : '↓'}{:else}↕{/if}
              </span>
            </button>
          {:else}
            <span class="label">{col.label}</span>
          {/if}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if isEmpty}
      <tr class="empty-row">
        <td class="cell empty" colspan={columns.length}>
          {#if empty}{@render empty()}{:else}No data{/if}
        </td>
      </tr>
    {:else}
      {#each sortedRows as row, i (getRowKey ? getRowKey(row, i) : i)}
        <tr class="row">
          {#each columns as col (col.key)}
            <td class="cell" class:numeric={col.numeric} data-align={colAlign(col)}>
              {#if col.cell}{@render col.cell(row)}{:else}{display(col, row)}{/if}
            </td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>

<style lang="scss">
  .ss-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--ss-font-body);
    font-size: var(--ss-table-font, var(--ss-ui-xs));
    color: var(--ss-fg);
    background: var(--ss-bg);

    caption {
      caption-side: top;
      text-align: left;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-muted);
      letter-spacing: 0.04em;
      padding-bottom: var(--ss-gap-sm);
    }

    .head {
      text-align: left;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ss-fg-muted);
      background: var(--ss-bg-elev);
      border-bottom: 1px solid var(--ss-line-strong);
      padding: var(--ss-table-py, 8px) var(--ss-table-px, 12px);
      white-space: nowrap;

      &[data-align='right'] {
        text-align: right;
      }
      &[data-align='center'] {
        text-align: center;
      }
      &.numeric {
        font-family: var(--ss-font-mono);
      }
    }

    .sort {
      display: inline-flex;
      align-items: center;
      gap: var(--ss-gap-sm);
      font: inherit;
      letter-spacing: inherit;
      text-transform: inherit;
      color: inherit;
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      transition: color var(--ss-dur-fast) var(--ss-ease);

      &:hover {
        color: var(--ss-fg);
      }
      &:focus-visible {
        outline: none;
        color: var(--ss-fg);
        box-shadow: 0 0 0 2px var(--ss-primary-soft);
      }
    }

    // Right-aligned headers flip the button so the indicator hugs the edge.
    .head[data-align='right'] .sort {
      flex-direction: row-reverse;
    }

    .indicator {
      color: var(--ss-fg-faint);
      font-family: var(--ss-font-mono);
      line-height: 1;
    }

    th[aria-sort='ascending'],
    th[aria-sort='descending'] {
      color: var(--ss-fg);
      .indicator {
        color: var(--ss-primary);
      }
    }

    .row {
      transition: background var(--ss-dur-fast) var(--ss-ease);
      &:hover {
        background: var(--ss-hover);
      }
    }

    .cell {
      padding: var(--ss-table-py, 8px) var(--ss-table-px, 12px);
      border-bottom: 1px solid var(--ss-line);
      vertical-align: middle;
      text-align: left;

      &[data-align='right'] {
        text-align: right;
      }
      &[data-align='center'] {
        text-align: center;
      }
      &.numeric {
        font-family: var(--ss-font-mono);
      }
      &.empty {
        text-align: center;
        color: var(--ss-fg-muted);
        font-family: var(--ss-font-mono);
        padding: var(--ss-table-empty-py, 24px) var(--ss-table-px, 12px);
      }
    }
  }
</style>
