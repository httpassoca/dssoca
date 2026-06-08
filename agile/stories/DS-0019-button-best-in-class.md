---
id: DS-0019
type: story
title: "Best-in-class Button component"
status: todo
priority: low
tags: [ui]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
As a `dssoca` consumer, I want `Button` to a button that covers async (loading) actions, destructive actions, icon affordances, full-width layout, and forwards native attributes, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today it is a thin wrapper (variant/type/disabled/onclick/size) missing the loading, danger, icon-only, and full-width states every best-in-class button ships, and it can't forward `aria-*`/`data-*` or expose an element ref.

## Acceptance criteria
- [ ] `Button` gains the improvements tracked in [[ds-0032-button-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0032-button-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Button.svelte`.
