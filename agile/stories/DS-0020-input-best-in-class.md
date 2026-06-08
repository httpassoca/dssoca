---
id: DS-0020
type: story
title: "Best-in-class Input component"
status: todo
priority: low
tags: [ui, a11y, forms]
depends_on: []
parent: null
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
As a `dssoca` consumer, I want `Input` to a text field that ships its own hint/error text, prefix/suffix affordances, clearable action, and forwards native input attributes, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today the consumer must hand-render helper/error text and wire `describedby` themselves, there is no prefix/suffix/clear, native attrs (readonly/autocomplete/inputmode/maxlength/other handlers) are dropped, and invalid/disabled states are visually identical to normal.

## Acceptance criteria
- [ ] `Input` gains the improvements tracked in [[ds-0033-input-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0033-input-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Input.svelte`.
