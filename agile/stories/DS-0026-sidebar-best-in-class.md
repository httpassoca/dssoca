---
id: DS-0026
type: story
title: "Best-in-class Sidebar component"
status: todo
priority: low
tags: [ui, a11y, app-shell]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
As a `dssoca` consumer, I want `Sidebar` to a side nav with proper navigation/list semantics, real links, a collapsible icon rail, grouped sections, nested items, and per-item badges, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today the root is a complementary `<aside>` of `role="button"` div-soup (not a nav landmark with lists), items can't be real links, there is no collapsed rail, no section grouping semantics, no nesting, and no count badges.

## Acceptance criteria
- [ ] `Sidebar` gains the improvements tracked in [[ds-0039-sidebar-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0039-sidebar-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Sidebar.svelte`.
