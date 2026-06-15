---
id: DS-0104
type: task
title: "BoxPlot implementation"
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
Build a new `BoxPlot` component at `src/lib/components/BoxPlot.svelte`: a token-driven
box-and-whisker distribution chart with an optional beeswarm/strip overlay of every value. Mirrors
the `ScatterPlot` conventions. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, runes).

## Acceptance criteria
- [x] **Groups** — `groups: BoxGroup[]` where `BoxGroup = { label; values; color? }`; one box per group; cycling palette + `color` override
- [x] **Five-number summary** — Q1/median/Q3 via `quantile`; Tukey whiskers (furthest values within `[q1-1.5·iqr, q3+1.5·iqr]`)
- [x] **Beeswarm** — `showPoints` (default true) overlays every value with *deterministic* jitter (no `Math.random`, SSR-stable); dots are `aria-hidden`
- [x] **Scales** — band x over group labels; linear y over the padded data extent; `yDomain` override; `yLabel`; `yFormat`
- [x] **Tooltip (a11y)** — `tooltip` (default true); each box `tabindex=0` `role="button"` + aria-label, reveals the five-number summary on focus/hover
- [x] **Sizing/layout** — `height` (300), `width` (420), `fluid`
- [x] **SR summary** — `summary` prop or auto-generated ("Box plot with N groups…"); root `role="group"` + `aria-label`
- [x] **Empty state** — em-dash + "No data" (no groups, or every group empty after filtering non-finite values)
- [x] **`size?: Size`** via `resolveComponentSize('Chart', size)`
- [x] Tests in `test/unit/BoxPlot.svelte.test.ts` (10 cases incl. vitest-axe); green
- [x] Docs: `documentation/src/lib/component-docs/box-plot.ts`
- [x] Story: `src/stories/BoxPlot.stories.svelte` (Default, Without points, Empty, Large)

## Notes
- Epic: [[DS-0102-geossoca-stats-dashboard-charts]]. Mirrors [[DS-0103-scatter-plot-implementation]].
- Drives geossoca's per-player consistency view (a short box = a steady player).
