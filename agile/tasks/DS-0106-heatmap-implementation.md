---
id: DS-0106
type: task
title: "Heatmap implementation"
status: done
priority: low
tags: [ui, a11y, dataviz]
depends_on: [DS-0103]
parent: null
epic: DS-0102
created: 2026-06-15
updated: 2026-06-15
---

## Description
Build a new `Heatmap` component at `src/lib/components/Heatmap.svelte`: a token-driven value-intensity
matrix with row/column headers, where each cell's colour intensity encodes its value. Primary use is
a small head-to-head win grid (4×4) with a blank diagonal. Mirrors the `ScatterPlot` conventions.

## Acceptance criteria
- [x] **Matrix** — `rows: string[]`, `columns: string[]`, `values: (number|null)[][]`; `null` → blank cell, excluded from the scale (e.g. the diagonal)
- [x] **Colour encoding** — `fill="var(--ss-primary)"` with `fill-opacity` from a clamped linear scale (range `[0.12, 1]`); `domain` override defaults to the non-null `extent`
- [x] **Cell values** — `showValues` (default true) draws the value text; `valueFormat`; `xLabel` / `yLabel`
- [x] **Layout** — intrinsic size from `cellSize` (48) × grid + header gutters; `max-width:100%` scales it down (no `fluid`)
- [x] **Tooltip (a11y)** — `tooltip` (default true); each non-null cell `tabindex=0` `role="button"` + aria-label ("{row} vs {column}: {value}"), reveals on focus/hover; null cells `aria-hidden`, non-focusable
- [x] **SR summary** — `summary` prop or auto-generated ("Heatmap, R rows × C columns."); root `role="group"` + `aria-label`
- [x] **Empty state** — em-dash + "No data" (no rows or no columns)
- [x] **`size?: Size`** via `resolveComponentSize('Chart', size)`
- [x] Tests in `test/unit/Heatmap.svelte.test.ts` (10 cases incl. vitest-axe); green
- [x] Docs: `documentation/src/lib/component-docs/heatmap.ts`
- [x] Story: `src/stories/Heatmap.stories.svelte` (Default, Without values, Empty, Large)

## Notes
- Epic: [[DS-0102-geossoca-stats-dashboard-charts]]. Mirrors [[DS-0103-scatter-plot-implementation]].
- Drives geossoca's 4×4 head-to-head win matrix.
