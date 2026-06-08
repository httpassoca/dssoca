---
id: DS-0021
type: story
title: "Best-in-class Card component"
status: in-progress
priority: high
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
As a `dssoca` consumer, I want `Card` to a card with header/body/footer + media regions, an optional clickable/linkable surface, and surface variants, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today it only has a header + body, the root identity class is `.ss-panel` (house-rule violation — should be `.ss-card`), and line 22 uses an inline `style` with hardcoded `12px` instead of a token.

## Acceptance criteria
- [ ] `Card` gains the improvements tracked in [[ds-0034-card-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0034-card-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Card.svelte`.
