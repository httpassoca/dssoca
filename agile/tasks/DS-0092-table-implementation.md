---
id: DS-0092
type: task
title: "Table implementation"
status: done
priority: low
tags: [ui, a11y, data]
depends_on: []
parent: null
epic: DS-0090
created: 2026-06-15
updated: 2026-06-15
---

## Description
Build a new generic `Table` component at `src/lib/components/Table.svelte` — a semantic data table
(`<table>`/`<thead>`/`<tbody>`) driven by a declarative `columns` array and a `rows` array. Keep it
token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes).

## Acceptance criteria
- [x] **Declarative columns** — `TableColumn[]` with `key`/`label`/`align`/`sortable`/`numeric`/`format`/`cell`
- [x] **Custom cells** — optional `cell?: Snippet<[row]>` per column; falls back to `format` then the raw value
- [x] **Sorting** — clicking a sortable header toggles asc/desc and re-sorts rows (numeric-aware for numeric
  columns, string compare otherwise); `sort` is `$bindable` and an `onsort` callback fires on change
- [x] **A11y** — sortable header cell is a `<button>` inside `<th>`; the `<th>` carries `aria-sort`
  (ascending | descending | none); numeric columns right-aligned + `--ss-font-mono`
- [x] **Empty state** — `empty?: Snippet` shown when `rows` is empty, else a default muted "No data" row
  spanning all columns; optional subtle `caption`; `getRowKey` for keyed iteration
- [x] **`size?: Size`** prop resolved via `resolveComponentSize('Table', size)`, applied as `data-size-variant`
- [x] Exports `TableColumn` (and `TableSort`) types
- [x] Tests added in `test/unit/Table.svelte.test.ts` (16); `pnpm test` green; `svelte-check` clean
- [x] Docs: `Table` page in `documentation/src/lib/component-docs/table.ts`
- [x] Stories: `src/stories/Table.stories.svelte` (Default, Sortable, Numeric columns, Custom cell snippet, Empty, Large)

## Notes
- Story: [[ds-0049-image-component]] · Epic: [[DS-0043-new-components-from-website]].
- Identity root class `.ss-table`; internal scoped names stay unprefixed (`.head`, `.cell`, `.sort`, `.row`).
- Component-specific metrics use inline `var(--ss-table-*, fallback)` rather than editing global SCSS:
  `--ss-table-font`, `--ss-table-px`, `--ss-table-py`, `--ss-table-empty-py`.
- Wiring of `src/lib/index.ts`, `documentation/src/lib/component-docs/index.ts`, and the real
  `COMPONENT_NAMES` entry is owned by the integrator (this branch adds the `COMPONENT_NAMES` entry so the
  component type-checks).
