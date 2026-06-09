---
id: DS-0018
type: story
title: "Best-in-class Badge component"
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
As a `dssoca` consumer, I want `Badge` to use one badge primitive for status pills, neutral category tags, and count/notification badges — not just the four fixed status tones, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today `hasDot` is dead logic that forces a dot on every badge, there is no neutral tone, no label-less or dismissible mode, and the dot size/gap and tone alphas are hardcoded so they don't rescale or track the theme.

## Acceptance criteria
- [ ] `Badge` gains the improvements tracked in [[ds-0031-badge-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0031-badge-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/Badge.svelte`.
