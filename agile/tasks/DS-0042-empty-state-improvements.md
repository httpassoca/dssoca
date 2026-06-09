---
id: DS-0042
type: task
title: "EmptyState improvements"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: DS-0029
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `EmptyState` (`src/lib/components/EmptyState.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Add a `no-results` variant** — extend the union to `empty|error|no-results` (no `role="alert"`, but politely announced — see next)
- [ ] **`role="status"` for non-error states** — give `no-results` (and empty-after-content) `role="status"` so it announces without moving focus (WCAG 4.1.3)
- [ ] **secondaryAction + footer snippets** — add `secondaryAction?` beside primary in `.act` and a low-emphasis `footer?` Snippet for tertiary links
- [ ] **Icon-or-snippet visual slot** — add a `visual?` Snippet (drop in `<Icon>`/illustration), keep string `icon` as fallback, replace the hardcoded 40px with a token
- [ ] **Compact / inline density** — add `compact?` (or `density?`) dropping padding and title size so it fits inside Card/ServiceCard/table cells
- [ ] **Constrain width + fullWidth override** — cap `.ss-empty` width centered with `margin-inline:auto`; add `fullWidth?` escape hatch
- [ ] **Opt-out heading semantics** — allow `headingLevel: number|false` (false → plain `<p>`) so it doesn't pollute the outline inside an already-labelled region
- [ ] Tests extended in `test/unit/EmptyState.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0029-empty-state-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
