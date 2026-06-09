---
id: DS-0022
type: story
title: "Best-in-class Sparkline component"
status: done
priority: high
tags: [ui, dataviz, a11y]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want `Sparkline` to an inline micro-chart that actually rescales, normalizes honestly, reads its data to assistive tech, and offers line/area variants, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today the `size` prop is wired but inert (SCSS hardcodes 18px height / 3px bars / 1px gap), normalization floors at max only so flat-looking series, bars are `aria-hidden` with no text alternative, and empty/single-point inputs are mishandled (`Math.max(...[])` → -Infinity).

## Acceptance criteria
- [ ] `Sparkline` gains the improvements tracked in [[ds-0035-sparkline-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0035-sparkline-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Sparkline.svelte`.
