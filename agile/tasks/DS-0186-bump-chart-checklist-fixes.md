---
id: DS-0186
type: task
title: "BumpChart: Front-End Checklist fixes"
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

Fix the Front-End Checklist findings (issue #139) that name BumpChart.

### Medium · `aria-roles` / `tabindex` (BumpChart section + Cross-cutting chart finding)

Confirmed: every node was `role="button" tabindex="0"` with no activation behaviour, so a
4 × 4 chart had 16 tab stops of fake buttons. **Fixed**: nodes are `role="img"` with their
existing `aria-label` ("<series>: <stage>, rank <n>"), and the chart is one tab stop with a
roving tabindex driven by `chartNavStep` (`src/lib/chart-nav.ts`). The first node holds
`tabindex="0"` by default, then the last-focused node does; all others are `-1`. Arrow keys,
Home and End call `chartNavStep`, `preventDefault`, and focus the new node.

**Order: 1-D, series-major** (each series' nodes stage by stage, then the next series). A 2-D
grid was rejected because nodes with a non-finite rank are skipped, so the series × stage matrix
is ragged and `cols`-based Up/Down would land on the wrong stage. Rows in a bump chart also
aren't spatial rows: lines cross, so "the row below" has no visual meaning. Walking along one
line matches how the chart reads ("how did Ana do across the night?"), and the label already names
the series and stage at every step. Left/Right stay physical in RTL because the SVG geometry
does not mirror.

### Low · `aria-live-regions` / `accessible-tooltips` (Cross-cutting chart finding)

Confirmed: the tooltip was `role="status"`, so each node was announced twice and hovering also
triggered announcements. **Fixed**: the tooltip is `aria-hidden="true"` with no role. It showed
only series, stage and rank, which the node's `aria-label` already carries, so nothing had to
move. Escape hides it, both from a focused node and through a window `keydown` listener that is
active only while the tooltip is visible (this covers a tooltip opened by hover, WCAG 1.4.13).

### Not applicable

Focus-ring (`--ss-primary-soft`) and RTL-property findings don't name BumpChart. The node's
`:focus-visible` cue is a 2px `--ss-fg` stroke plus a larger radius, not the faint token.

### Tests (`test/unit/BumpChart.svelte.test.ts`)

- marks are `role="img"` and exactly one has `tabindex="0"`
- ArrowRight/ArrowLeft walk series-major across the series boundary and move the tab stop
- Home/End jump to the ends, with `defaultPrevented`
- the last-focused node keeps the tab stop after blur
- skipped (non-finite) nodes leave contiguous indices
- the tooltip is `aria-hidden`, has no role, and Escape hides it
- Escape on the document hides a hover-opened tooltip
- the node label contains everything the tooltip shows
