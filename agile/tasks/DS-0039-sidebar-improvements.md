---
id: DS-0039
type: task
title: "Sidebar improvements"
status: done
priority: low
tags: [ui, a11y, app-shell]
depends_on: []
parent: DS-0026
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `Sidebar` (`src/lib/components/Sidebar.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Wrap in `<nav>` with list semantics** — change root to `<nav aria-label="Sidebar">` and render groups as `<ul><li>` so AT hears item counts/hierarchy
- [ ] **Real links instead of div-buttons** — add optional `href` per item → `<a aria-current>` (drop the keydown); keep `onSelect` as the SPA fallback
- [ ] **Collapsible rail (icon-only) mode** — add `collapsed?` (+ `onToggleCollapsed`) hiding labels/section text and narrowing via a width token (`data-collapsed`)
- [ ] **Accessible name when collapsed** — tooltip or `aria-label`/`title` on the link when collapsed; consider surfacing degraded/down in the name
- [ ] **Section group labels** — tie each group `<ul>` to its label via `aria-label`/`aria-labelledby` (label never a link)
- [ ] **Nested / expandable sub-items** — add optional `children?: SideItem[]` rendered as a Disclosure (`aria-expanded`/`aria-controls`), one level deep, auto-expanded when active
- [ ] **Per-item badge / count** — add `badge?: string|number` rendered near the dot (token-driven, zero radius); include the count in the accessible name
- [ ] Tests extended in `test/unit/Sidebar.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0026-sidebar-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
