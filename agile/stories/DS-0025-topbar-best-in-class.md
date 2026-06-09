---
id: DS-0025
type: story
title: "Best-in-class Topbar component"
status: done
priority: low
tags: [ui, a11y, app-shell]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want `Topbar` to an app top bar with proper landmarks, a skip link, a keyboard-navigable nav, a working command-palette trigger, an interactive user menu, and data-driven content, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today it is essentially a presentational mock — a bare `<div>` with no header/nav landmark, no skip link, no roving-tabindex, a non-interactive `⌘K` chip and user string, and hardcoded brand/stats.

## Acceptance criteria
- [ ] `Topbar` gains the improvements tracked in [[ds-0038-topbar-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0038-topbar-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Topbar.svelte`.
