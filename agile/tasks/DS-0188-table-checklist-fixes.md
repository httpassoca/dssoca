---
id: DS-0188
type: task
title: "Table: Front-End Checklist fixes"
status: done
priority: low
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Front-End Checklist findings for `Table` (issue #139).

- **Medium · `focus-styles` (sort button, `Table.svelte:224-228`)** — fixed. Removed the
  `outline: none` + `box-shadow: 0 0 0 2px var(--ss-primary-soft)` override on `.sort:focus-visible`,
  so the compliant base ring (`outline: 2px solid var(--ss-primary); outline-offset: 2px`) applies.
  The focused button still brightens to `--ss-fg`.
- **Low · `logical-properties` (`Table:174,183,261`)** — fixed. Caption, header and cell defaults
  use `text-align: start`; end alignment uses `text-align: end`. `TableColumn.align` now accepts
  `'start' | 'end' | 'center'` and still accepts legacy `'left' | 'right'`, which map to
  `start`/`end`. Cells render `data-align="start" | "end" | "center"`; the CSS also matches the
  legacy `data-align="right"` so existing plain-HTML markup keeps working (`left` falls through to
  the `start` default). The end-aligned header still flips the sort button (`row-reverse`, which is
  direction-aware).

### Tests (`test/unit/Table.svelte.test.ts`)
- Numeric columns render `data-align="end"` (was `right`); text columns default to `start`.
- `align: left/right/start/end/center` map to `start/end/start/end/center` on header and body.
- Source assertions: no `--ss-primary-soft` / `outline: none` in the style block, and no physical
  `text-align: left|right`.
