---
id: DS-0045
type: story
title: "Accordion component"
status: backlog
priority: low
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want an **Accordion** (collapsible disclosure) component — a header with a
rotating chevron that expands/collapses an animated content region — so I can present FAQs, grouped
settings, and progressive-disclosure content with correct semantics and keyboard support out of the box.
The website implements this as `AppExtension.svelte` (chevron rotates 180°, animated max-height + margin,
Enter/Space toggle, `open` event), but it is single-panel and app-specific; a design-system version should
generalize it.

## Acceptance criteria
- [ ] `Accordion` gains the behaviour tracked in [[ds-0051-accordion-implementation]] (the per-component task)
- [ ] Changes are additive — new file + barrel export; no existing component touched
- [ ] New chrome reads `--ss-*` size tokens (incl. motion duration) and respects zero border-radius
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0043-new-components-from-website]].
- Concrete work is the single task [[ds-0051-accordion-implementation]]; the detailed checklist lives there.
- Source: `passoca/src/lib/components/AppExtension.svelte`.
