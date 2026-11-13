---
id: DS-0184
type: task
title: "Chart: Front-End Checklist fixes"
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

Fixes the Chart findings from the Front-End Checklist audit (GitHub issue #139).

### Medium · `aria-roles` / `tabindex` (cross-cutting chart finding)

Confirmed: every point/bar was `role="button" tabindex="0"` with no activation behaviour, one
tab stop per datum. Fixed: marks are now `role="img"` (existing `aria-label` kept, it already
carries series, x and y) with a roving tabindex via `chartNavStep` (`src/lib/chart-nav.ts`).
Exactly one mark has `tabindex="0"` (the last focused, the first by default), the rest `-1`.
Arrow keys / Home / End move focus and `preventDefault`; other keys pass through. Bars are
flattened in render order (category, then series). SVG geometry does not mirror in RTL, so
Left/Right stay physical (same as Heatmap).

### Low · `aria-live-regions` / `accessible-tooltips` (cross-cutting)

Confirmed: the tooltip was `role="status"`. Fixed: it is now `aria-hidden="true"` (all of its
text was already in the mark's label), and Escape dismisses it, both from a focused mark and
via a window listener for a hover-opened tooltip (WCAG 1.4.13).

### Medium · `sensory-instructions` (WCAG 1.4.1): series told apart by colour only

Confirmed for line/area (`path.line` stroke colour) and the legend (colour block swatch).
Fixed for line/area:
- New `dashes` prop (default `true`): series 0 solid, later series take a `stroke-dasharray`
  from the fixed `CHART_DASH_CYCLE` (exported from Chart's module script). Dashed lines use
  butt caps so short gaps stay visible.
- Legend keys for line/area are now a short SVG stroke (`.swatch-line`) carrying the same
  colour and dash pattern as the line; bars keep the colour block.
- New `endLabels` prop (default `false`): prints each series' label after its last datum,
  nudged apart (min 12 units) so labels never overlap; the right margin grows to fit them.
  End-labels are `aria-hidden` (the legend and mark labels already name the series).

Not covered: grouped bars still differ by colour (and fixed in-group position); scope for this
task was line/area.

### Tests (`test/unit/Chart.svelte.test.ts`)

- roles + single roving tab stop for points and bars; arrow/Home/End focus movement;
  `preventDefault` only on navigation keys
- tooltip `aria-hidden` with no role; Escape dismisses (focus and hover)
- series 0 solid / series 1 dashed for line and area; distinct pattern per series across the
  cycle; `dashes=false` → all solid; legend key dash equals its line's dash; bars keep block
  swatches; end-labels off by default, one per series when on, kept apart when tied
- axe: area + end-labels
- **Lead follow-up:** `CHART_DASH_CYCLE` is exported from `dssoca`. Data marks use `cursor: default` (they are not clickable), aligned across Chart, BoxPlot, BumpChart, Heatmap and ScatterPlot.
- **Deferred:** grouped bars still differ by colour + position within the group (legend order); pattern fills for bars are a possible follow-up.
