---
id: DS-0103
type: task
title: "ScatterPlot implementation"
status: done
priority: low
tags: [ui, a11y, dataviz]
depends_on: []
parent: null
epic: DS-0102
created: 2026-06-15
updated: 2026-06-15
---

## Description
Build a new `ScatterPlot` component at `src/lib/components/ScatterPlot.svelte`: a token-driven,
two-axis scatter with optional quadrant reference lines and bubble sizing. Scales are computed with
`d3-scale`/`d3-array` and rendered as plain Svelte SVG. Token-driven (zero radius, `--ss-*` tokens,
scoped SCSS, Svelte 5 runes).

## Acceptance criteria
- [x] **Points** — `points: ScatterPoint[]` where `ScatterPoint = { label; x; y; size?; color? }`; cycling palette + `color` override
- [x] **Bubble sizing** — `size` maps to a sqrt (area-true) radius scale; fixed dot when no point carries a size
- [x] **Quadrants** — `xRef` / `yRef` dashed reference lines; `quadrantLabels` corner captions
- [x] **Scales** — linear x/y over the padded data extent (not forced to zero); `xDomain` / `yDomain` overrides; ~5 ticks + gridlines
- [x] **Labelling** — `showLabels` (default true) draws each point label; `xLabel` / `yLabel` axis captions; `xFormat` / `yFormat`
- [x] **Tooltip (a11y)** — `tooltip` (default true); each point `tabindex=0` `role="button"` + `aria-label`, reveals on focus/hover (keyboard accessible)
- [x] **Sizing/layout** — `height` (320), `width` (420), `fluid` (viewBox width:100%)
- [x] **SR summary** — `summary` prop or auto-generated; root `role="group"` + `aria-label`
- [x] **Empty state** — em-dash placeholder + "No data" name, like Sparkline/Chart
- [x] **`size?: Size`** resolved via `resolveComponentSize('Chart', size)`, applied as `data-size-variant`
- [x] Tests in `test/unit/ScatterPlot.svelte.test.ts` (12 cases incl. vitest-axe); green
- [x] Docs: `documentation/src/lib/component-docs/scatter-plot.ts`
- [x] Story: `src/stories/ScatterPlot.stories.svelte` (Quadrants, Bubble size, Plain, Empty, Large)

## Notes
- Epic: [[DS-0102-geossoca-stats-dashboard-charts]]. The reference component the other DS-0102 charts mirror.
- Drives geossoca's "skill vs consistency" and "win-rate vs avg-score" quadrant views.
