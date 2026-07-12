---
id: DS-0134
type: task
title: "Docs: add missing chart previews on the all-components page"
status: done
priority: low
tags: [docs, dataviz]
depends_on: []
parent: null
epic: DS-0102
created: 2026-07-12
updated: 2026-07-12
---

## Description

The all-components overview (`documentation/src/routes/components/+page.svelte`) rendered an empty
preview stage for `ScatterPlot`, `BoxPlot`, `BumpChart` and `Heatmap`: the four are fully
registered (component-docs, `COMPONENTS`, `categories.ts`) but the page's inline
`{#snippet preview(slug)}` if/else chain had no branch for their slugs, so the stage fell through
blank.

## Acceptance criteria

- [x] The four components are imported from `dssoca` on the overview page and each slug gets a
      preview branch following the existing `Chart` pattern (`.w-full` wrapper + `height={150}`
      + `fluid`)
- [x] Heatmap (no `fluid`/`height` — sized by `cellSize`) uses a 3×3 matrix with `cellSize={32}`
      (28 + 96 = 124px) so it fits the fixed 168px stage
- [x] Sample data mirrors the docs' existing flavour (Ada/Grace/Alan) and each component's
      documented prop shapes
- [x] `pnpm docs:test` and the full CI command set stay green

## Notes

- Registry side needed no changes — this was purely the preview snippet chain.
- Epic: [[DS-0102-geossoca-stats-dashboard-charts]] (previews for its four chart components).
