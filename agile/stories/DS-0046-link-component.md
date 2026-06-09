---
id: DS-0046
type: story
title: "Link component"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want a styled **Link** component — an anchor with the design system's animated
underline (and an optional button-styled variant) — so inline and standalone links share one consistent,
accessible treatment instead of being styled ad hoc. The website's `AppLink.svelte` carries the signature
behaviour: a pseudo-element underline with a cubic-bezier reveal + glow (box-shadow), a `button` variant
(solid primary, no underline), and external-link handling (`target="_blank"` + `rel="noopener noreferrer"`).

## Acceptance criteria
- [ ] `Link` gains the behaviour tracked in [[ds-0052-link-implementation]] (the per-component task)
- [ ] Changes are additive — new file + barrel export; no existing component touched
- [ ] New chrome reads `--ss-*` tokens (color, motion) and respects zero border-radius; visible focus
- [ ] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0043-new-components-from-website]].
- Concrete work is the single task [[ds-0052-link-implementation]]; the detailed checklist lives there.
- Source: `passoca/src/lib/components/Base/AppLink.svelte`.
