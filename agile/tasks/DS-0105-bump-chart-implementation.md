---
id: DS-0105
type: task
title: "BumpChart implementation"
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
Build a new `BumpChart` component at `src/lib/components/BumpChart.svelte`: a token-driven
ranking-over-stages chart that plots each competitor's finishing rank (1 = top) across an ordered
sequence of stages and connects them with lines. Mirrors the `ScatterPlot` conventions.

## Acceptance criteria
- [x] **Series + stages** — `series: BumpSeries[]` (`{ label; ranks; color? }`, 1-based ranks) over `stages: string[]`
- [x] **Rank axis** — linear y with rank 1 at the TOP; integer rank ticks; `maxRank` = max finite rank (defaults to series count)
- [x] **Lines + nodes** — `d3-shape` line per series through its nodes; gappy series (non-finite rank) skip a node but the line still connects present nodes
- [x] **Direct labelling** — `showLabels` (default true) draws the series label at its last node (in series colour)
- [x] **Scales** — `scalePoint` x over stages; cycling palette + `color` override
- [x] **Tooltip (a11y)** — `tooltip` (default true); each node `tabindex=0` `role="button"` + aria-label ("{label}: {stage}, rank {n}"), reveals on focus/hover
- [x] **Sizing/layout** — `height` (280), `width` (480), `fluid`
- [x] **SR summary** — `summary` prop or auto-generated ("Bump chart with N series over M stages…"); root `role="group"` + `aria-label`
- [x] **Empty state** — em-dash + "No data" (no series or no stages)
- [x] **`size?: Size`** via `resolveComponentSize('Chart', size)`
- [x] Tests in `test/unit/BumpChart.svelte.test.ts` (12 cases incl. vitest-axe); green
- [x] Docs: `documentation/src/lib/component-docs/bump-chart.ts`
- [x] Story: `src/stories/BumpChart.stories.svelte` (Default, Without labels, Empty, Large)

## Notes
- Epic: [[DS-0102-geossoca-stats-dashboard-charts]]. Mirrors [[DS-0103-scatter-plot-implementation]].
- Drives geossoca's per-Friday "who led across the 4 games" view.
