---
id: DS-0024
type: story
title: "Best-in-class MetricTile component"
status: done
priority: low
tags: [ui, a11y, dataviz]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want `MetricTile` to a KPI tile whose delta colour encodes sentiment (not raw direction), reads accessibly, and can show a comparison period, trend chart, prefix, and loading state, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today `up → green` is hardcoded so a rising error rate renders "good", the delta arrow leaks into the accessible name, and there is no comparison label, sparkline slot, value prefix, or loading state.

## Acceptance criteria
- [ ] `MetricTile` gains the improvements tracked in [[ds-0037-metric-tile-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0037-metric-tile-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/MetricTile.svelte`.
