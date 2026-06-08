---
id: DS-0017
type: story
title: "Best-in-class Icon component"
status: todo
priority: low
tags: [ui, icon]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
As a `dssoca` consumer, I want `Icon` to import an icon component that scales optically, can be extended with my own glyphs, and exposes a robust accessible name, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today today it is a closed 18-glyph set with a single `aria-label` path, a viewBox-relative stroke that renders unevenly across sizes, and no animation/orientation controls.

## Acceptance criteria
- [ ] `Icon` gains the improvements tracked in [[ds-0030-icon-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0030-icon-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Icon.svelte`.
