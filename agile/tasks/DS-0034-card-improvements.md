---
id: DS-0034
type: task
title: "Card improvements"
status: done
priority: high
tags: [ui, a11y]
depends_on: []
parent: DS-0021
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `Card` (`src/lib/components/Card.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Fix identity class + remove inline px** — rename root to `.ss-card` and move the inline `gap:12px` header-actions style into a scoped `.actions` class using `--ss-gap*`
- [ ] **Footer snippet region** — add `footer?: Snippet` in a `.foot` band mirroring `.head`, rendered only when provided
- [ ] **Media / header-visual snippet** — add `media?: Snippet` full-bleed above `.head` for thumbnails/charts/Sparkline
- [ ] **Optional linkable / clickable card** — add `href?`/`onclick?` with an overlay `::after` hitbox; keep action/footer controls on a higher z-index
- [ ] **Surface variants** — add `variant?: outlined|elevated` (elevated uses `--ss-shadow-*`); zero radius preserved
- [ ] **Split title + description; title Snippet** — add `description?` under the heading in `--ss-fg-muted` and allow a full `title` Snippet for inline icons/badges
- [ ] **Accessible labelled region** — give `.ss-card` `aria-labelledby` pointing at the generated title id; allow omitting the heading role
- [ ] Tests extended in `test/unit/Card.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0021-card-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
