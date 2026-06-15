---
id: DS-0091
type: task
title: "Chart implementation"
status: done
priority: low
tags: [ui, a11y, dataviz]
depends_on: []
parent: null
epic: DS-0090
created: 2026-06-15
updated: 2026-06-15
---

## Description
Build a new `Chart` component at `src/lib/components/Chart.svelte`: a token-driven, multi-series
line / area / grouped-bar chart. Scales and paths are computed in the component and rendered as
plain Svelte SVG markup (no d3 DOM selection). Keep it token-driven (zero radius, `--ss-*` tokens,
scoped SCSS, Svelte 5 runes).

## Acceptance criteria
- [x] **Multi-series** — `series: ChartSeries[]` where `ChartPoint = { x: number | Date; y: number }`; cycling categorical palette, `series.color` override
- [x] **Variants** — `line` (default), `area`, and grouped `bar` per x-category across series
- [x] **Scales** — `xType` of `linear` / `time` / `band`, auto-detected (band for bars, time for Date x, else linear); linear y with a "nice" rounded top; ~5 axis ticks
- [x] **Axes/gridlines** — SVG lines/text using `--ss-line`; tick text `--ss-font-mono` / `--ss-fg-muted` / `--ss-ui-xs`
- [x] **Formatting** — `xFormat` / `yFormat` for ticks + tooltip
- [x] **Tooltip (a11y)** — `tooltip` (default true); each datum is `tabindex=0` `role="button"` with an `aria-label`, and reveals the tooltip on focus/hover (keyboard accessible)
- [x] **Legend** — `legend` (default true): series labels + colour swatches
- [x] **Sizing/layout** — `height` (240), `width` (480), `fluid` (viewBox-driven width:100%)
- [x] **SR summary** — `summary` prop or auto-generated; root `role="group"` + `aria-label`
- [x] **Empty state** — em-dash placeholder + "No data" name, like Sparkline
- [x] **`size?: Size`** resolved via `resolveComponentSize('Chart', size)`, applied as `data-size-variant`
- [x] Tests in `test/unit/Chart.svelte.test.ts` (17 cases incl. vitest-axe for line/bar/empty); green
- [x] Docs: `documentation/src/lib/component-docs/chart.ts`
- [x] Story: `src/stories/Chart.stories.svelte` (Default, Area, Grouped Bars, Single Series, Time axis, Empty, Large)

## Notes
- Story: [[ds-0049-chart-component]] · Epic: [[DS-0043-new-components-from-website]].
- **Dependency decision (d3 vs inline math):** the spec referenced `d3-scale`/`d3-shape`/`d3-array`,
  but those packages are not actually installed/resolvable in this environment (no network, absent
  from the pnpm store index and the workspace lockfile). To keep dssoca's zero-runtime-dep posture
  and a green build, the scale/extent/path math is implemented inline (~40 lines). The public API is
  unchanged, so swapping in d3 later is a drop-in if it becomes available.
- **Component-local metric token:** `--ss-chart-h` (fallback `240px`) used only for the empty-state
  placeholder min-height; no global SCSS token added.
- Integrator owns wiring (`src/lib/index.ts`, docs index, real `COMPONENT_NAMES` entry).
