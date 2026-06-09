---
id: DS-0035
type: task
title: "Sparkline improvements"
status: done
priority: high
tags: [ui, dataviz, a11y]
depends_on: []
parent: DS-0022
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `Sparkline` (`src/lib/components/Sparkline.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Make sizing actually rescale** — replace the hardcoded 18px/3px/1px with size tokens so `data-size-variant` changes the chart (house rule)
- [ ] **Normalize against min, not just max** — scale across the real `[min,max]` (guard `min===max`); optional `min`/`max` props for a shared scale across rows
- [ ] **Screen-reader text alternative** — auto-generate a visually-hidden summary (first→last, direction, min/max, n) or accept a `summary`/`valueFormat` prop
- [ ] **Colour by trend (opt-in)** — add `trend?: auto|up|down|flat|none`; `auto` derives direction → `--ss-success`/`--ss-danger`, default `none` keeps current behaviour
- [ ] **Handle empty + single-point inputs** — explicit empty branch (em-dash + "no data" label) and a centered flat marker for a single value
- [ ] **Line / area variant** — add `variant?: bars|line|area` backed by an inline SVG polyline/path; `area` fills under the curve at reduced opacity
- [ ] **Responsive / fluid width** — add a `fluid`/`width` option (bars flex, or SVG `viewBox` + `width:100%`) so it fits a table cell
- [ ] Tests extended in `test/unit/Sparkline.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0022-sparkline-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
