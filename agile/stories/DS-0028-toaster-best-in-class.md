---
id: DS-0028
type: story
title: "Best-in-class Toaster component"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want `Toaster` to a toast system that pauses on hover/focus, supports action buttons, per-toast/sticky durations, a capped queue, configurable position, promise toasts, and swipe/keyboard dismissal, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today auto-dismiss is a fire-once `setTimeout` that can't pause (a toast vanishes mid-read — WCAG 2.2 "enough time"), there are no action buttons, the stack is unbounded, position is hardcoded, and there is no promise/update or swipe/Esc dismissal.

## Acceptance criteria
- [ ] `Toaster` gains the improvements tracked in [[ds-0041-toaster-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0041-toaster-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Toaster.svelte`.
