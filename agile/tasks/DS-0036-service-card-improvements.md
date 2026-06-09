---
id: DS-0036
type: task
title: "ServiceCard improvements"
status: done
priority: high
tags: [ui, a11y]
depends_on: []
parent: DS-0023
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `ServiceCard` (`src/lib/components/ServiceCard.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Visible focus indicator** — add a scoped `:focus-visible` outline/ring matching the system convention (clears the 1px border)
- [ ] **Replace hardcoded `#232323` hover** — swap to a theme token (e.g. a `--ss-bg-elev-hover`) so hover survives the `data-theme` flip
- [ ] **Loading / skeleton state** — add `loading?: boolean` → `aria-busy`, suppressed click, shimmer placeholders so no misleading "up" flashes
- [ ] **"Last checked" timestamp** — add optional `updatedAt` rendered as a relative `<time datetime>` in the footer (mono, `--ss-fg-muted`)
- [ ] **Real `<a>` when it navigates** — add optional `href`; render an anchor (drop the synthetic keydown) and keep the `role="button"` path only for pure `onclick`
- [ ] **Broaden status model + expose to AT** — add a `maint`/maintenance state and fold the spelled-out status into the card `aria-label`
- [ ] **`disabled` variant + meta snippet** — add `disabled?` (aria-disabled, no tabindex/onclick) and an optional `children`/`meta` Snippet for extra rows
- [ ] Tests extended in `test/unit/ServiceCard.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0023-service-card-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
