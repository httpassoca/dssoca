---
id: DS-0029
type: story
title: "Best-in-class EmptyState component"
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
As a `dssoca` consumer, I want `EmptyState` to an empty state that also covers no-results, announces politely, supports primary+secondary actions and a footer, a real visual/illustration slot, and compact density, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today it only models empty|error, a swapped-in "no results" is silent to AT (no `role="status"`), there is one action slot, the icon is a hardcoded 40px glyph that can't use `Icon.svelte` or rescale, and it always emits a heading and stretches full width.

## Acceptance criteria
- [ ] `EmptyState` gains the improvements tracked in [[ds-0042-empty-state-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0042-empty-state-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/EmptyState.svelte`.
