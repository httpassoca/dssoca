---
id: DS-0187
type: task
title: "ScatterPlot: Front-End Checklist fixes"
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

Fix the ScatterPlot findings from the Front-End Checklist audit (GitHub issue #139).

- **Medium · `aria-roles`, `tabindex` (`:230-231`)**: fixed. Points were `role="button" tabindex="0"`
  with no activation. They are now `role="img"` with their existing `aria-label`, on a roving
  tabindex driven by `chartNavStep` (`src/lib/chart-nav.ts`): one tab stop (the last-focused point,
  the first by default), Arrow keys / Home / End move focus. `cursor` changed from `pointer` to
  `default` since the points are no longer actionable.
- **Low · `aria-text` (`:239`)**: fixed. `.point-label` is `aria-hidden="true"`.
- **Low · `aria-live-regions` / `accessible-tooltips` (Cross-cutting)**: fixed. The tooltip drops
  `role="status"` and is `aria-hidden="true"`; it showed only label + x + y, which the point's
  `aria-label` already carries. Escape hides it, both from the focused point and via a window
  listener while a hover tooltip is open (WCAG 1.4.13).

Tests (`test/unit/ScatterPlot.svelte.test.ts`): points are `role="img"`; point labels are
aria-hidden; single tab stop; Arrow/Home/End move focus and the tab stop; last-focused point keeps
the tab stop; tooltip is aria-hidden with no role; Escape hides the tooltip after focus and after
hover. Docs: `documentation/src/lib/component-docs/scatter-plot.ts` description, `notes` and the
`tooltip` prop.
