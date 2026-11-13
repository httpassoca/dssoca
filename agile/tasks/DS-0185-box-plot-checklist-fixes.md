---
id: DS-0185
type: task
title: "BoxPlot: Front-End Checklist fixes"
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

Front-End Checklist findings for `BoxPlot` (GitHub issue #139).

- **Medium · `aria-roles` / `tabindex` (chart marks were inert `role="button" tabindex="0"`)** —
  fixed. Boxes are now `role="img"` with a roving tabindex: one box has `tabindex="0"` (the last
  focused, the first by default), the rest `-1`. A `keydown` on a box calls `chartNavStep`
  (`src/lib/chart-nav.ts`), prevents the default and focuses the new box (Arrow keys, Home, End;
  clamped). Root keeps `role="group"` + its summary label.
- **Low · `aria-live-regions` / `accessible-tooltips` (cross-cutting: tooltip was `role="status"`,
  no Escape)** — fixed. The tooltip is `aria-hidden="true"` with no role; a window `keydown`
  listener hides it on Escape whether it was opened by hover or focus (WCAG 1.4.13).
- **Low · `aria-live-regions` (min/max only in the tooltip)** — fixed. `boxLabel` now ends with
  `, min <lo>, max <hi>` (the whisker ends the tooltip shows), formatted with `yFormat`.

Tests added in `test/unit/BoxPlot.svelte.test.ts`: marks are `role="img"` (no `role="button"`);
exactly one `tabindex="0"`; arrow/Home/End move focus and the tab stop; non-navigation keys are
not cancelled; tooltip is `aria-hidden` without a role; Escape dismisses a focus- and a
hover-opened tooltip; label contains min and max.
