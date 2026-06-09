---
id: DS-0027
type: story
title: "Best-in-class LogStream component"
status: done
priority: high
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want `LogStream` to a real, controllable log viewer — fed my own lines, with live-region announcement, follow-tail that pauses on scroll-up, a controls toolbar, wrapping, and empty/loading states, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today it is a demo widget: hardcoded `TEMPLATES` on a timer, a fixed 30-line cap, an unconditional force-scroll-to-bottom (yanks the user back when reading history), a hardcoded `#0a0a0a` background, no `role="log"`, and no toolbar/empty/loading states.

## Acceptance criteria
- [ ] `LogStream` gains the improvements tracked in [[ds-0040-log-stream-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0040-log-stream-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/LogStream.svelte`.
