---
id: DS-0102
type: epic
title: "geossoca stats-dashboard charts — data-viz the performance dashboard needs"
status: done
priority: low
tags: [ui, epic, components, dataviz, adoption]
depends_on: [DS-0090]
parent: null
epic: null
created: 2026-06-15
updated: 2026-06-15
---

## Description
The `geossoca` GeoGuessr score-tracker is building a performance-comparison dashboard. Its design
calls for four data-viz primitives the design system does not yet ship — beyond the line/area/bar
`Chart` and `Table` delivered in [[DS-0090-geossoca-component-gaps]]. Rather than build them locally
in the app, they are added to dssoca so any consumer benefits:

- **ScatterPlot** — two-axis scatter with optional quadrant reference lines + bubble sizing. Drives
  the dashboard's "skill vs consistency" and "win-rate vs avg-score" views (the "always 2nd, never
  1st" comparison).
- **BoxPlot** — box-and-whisker distribution with an optional beeswarm overlay; compares each
  player's score spread (consistency = a short box).
- **BumpChart** — ranking-over-stages chart; shows who led across the 4 games of one Friday.
- **Heatmap** — value-intensity matrix with row/column headers; the 4×4 head-to-head win grid.

All four reuse the `Chart` runtime deps (`d3-scale`, `d3-shape`, `d3-array`); no new dependencies.

Each component honours the house rules: **zero border-radius**, `--ss-*` tokens, `.ss-*` identity
prefix, scoped SCSS, Svelte 5 runes, WCAG 2.2 AA (keyboard-focusable data, accessible tooltip + SR
summary, em-dash empty state), and the tests/docs/agile RULEs.

## Acceptance criteria
- [x] All child tasks (DS-0103 … DS-0106) are done.
- [x] Each component ships source + Storybook story + Vitest/axe test + docs page, wired into the
      barrel, the docs index, the docs category, and the landing exclusions.
- [x] `pnpm test`, `pnpm check`, `pnpm lint`, and `pnpm pack` (publint) stay green.
- [x] Board rebuilt (`node build.mjs`) as items move.

## Notes
- Consumer: the `geossoca` app (`/home/passoca/dev/geossoca`) — its stats layer (`src/lib/stats.ts`)
  computes the power rating, avg finish, podium rate, difficulty-adjusted score, and head-to-head
  records these charts render.
- Sibling epic: [[DS-0090-geossoca-component-gaps]].
- Tasks: [[DS-0103-scatter-plot-implementation]], [[DS-0104-box-plot-implementation]],
  [[DS-0105-bump-chart-implementation]], [[DS-0106-heatmap-implementation]].
