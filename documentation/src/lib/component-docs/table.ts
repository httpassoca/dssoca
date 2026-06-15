import { type ComponentDoc, SIZE_PROP } from './types'

export const table: ComponentDoc = {
  name: 'Table',
  slug: 'table',
  tagline: 'Generic data table with sortable, numeric-aware columns.',
  description:
    'A semantic data table built on real `<table>`/`<thead>`/`<tbody>` markup. Columns are declared once (`label`, `align`, `numeric`, `sortable`, plus an optional `format` or custom `cell` snippet); numeric columns right-align and use the mono font. Sortable headers are real `<button>`s that toggle `asc`/`desc` and re-sort rows (numeric-aware), driving the `aria-sort` on each `<th>`. Bind `sort` to control or observe ordering, and supply an `empty` snippet for the no-data state.',
  storyId: 'components-table--default',
  usage: `<script>
  import { Table } from 'dssoca';

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'commits', label: 'Commits', numeric: true, sortable: true },
  ];
  const rows = [
    { name: 'Ada', commits: 142 },
    { name: 'Grace', commits: 213 },
  ];

  let sort = $state({ key: 'commits', dir: 'desc' });
</script>

<Table {columns} {rows} bind:sort caption="Contributors" />`,
  props: [
    {
      name: 'columns',
      type: 'TableColumn[]',
      desc: 'Required. Column definitions: key, label, align, sortable, numeric, format, cell.',
    },
    { name: 'rows', type: 'any[]', desc: 'Required. Row data, each keyed by column `key`.' },
    {
      name: 'sort',
      type: '{ key: string; dir: "asc" | "desc" }',
      desc: 'Bindable active sort. Clicking a sortable header toggles asc/desc and re-sorts rows.',
    },
    {
      name: 'onsort',
      type: '(s: TableSort) => void',
      desc: 'Notified when the sort changes (in addition to updating the bound `sort`).',
    },
    {
      name: 'caption',
      type: 'string',
      desc: 'Optional <caption> rendered subtly above the grid.',
    },
    {
      name: 'empty',
      type: 'Snippet',
      desc: 'Content shown when `rows` is empty (replaces the default "No data" row).',
    },
    {
      name: 'getRowKey',
      type: '(row: any, i: number) => string | number',
      desc: 'Stable key per row for keyed iteration. Defaults to the row index.',
    },
    SIZE_PROP,
  ],
  notes:
    'Sortable header cells render a `<button>` inside the `<th>`, and the `<th>` carries `aria-sort` (ascending | descending | none). Numeric columns are right-aligned and use --ss-font-mono; rows highlight on hover via --ss-hover and the header has an --ss-line-strong bottom border. Zero border-radius throughout.',
}
