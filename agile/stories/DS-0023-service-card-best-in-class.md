---
id: DS-0023
type: story
title: "Best-in-class ServiceCard component"
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
As a `dssoca` consumer, I want `ServiceCard` to a service/status tile that shows a keyboard focus ring, a loading state, recency, and navigates as a real link when it opens a URL, so the component holds up next to a
best-in-class equivalent instead of being a thin wrapper. Today it has no `:focus-visible` style (WCAG 2.4.7), a hardcoded `#232323` hover that breaks light theme, no loading/timestamp/disabled states, and uses a `role="button"` div even when the footer implies navigation.

## Acceptance criteria
- [ ] `ServiceCard` gains the improvements tracked in [[ds-0036-service-card-improvements]] (the per-component task)
- [ ] Changes are additive / non-breaking where feasible; existing usage keeps working
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0016-components-improvements]].
- Concrete work is the single task [[ds-0036-service-card-improvements]]; the detailed checklist lives there.
- Source: `src/lib/components/ServiceCard.svelte`.
