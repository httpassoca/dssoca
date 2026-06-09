---
id: DS-0054
type: task
title: "BottomNav implementation"
status: backlog
priority: low
tags: [ui, a11y]
depends_on: []
parent: DS-0048
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
Build a new `BottomNav` component at `src/lib/components/BottomNav.svelte`, based on the website's
`MobileBottomNav.svelte`. Keep it token-driven (zero radius, `--ss-*` size + shell tokens, scoped SCSS,
Svelte 5 runes).

## Acceptance criteria
- [ ] **Items model** — `items: NavItem[]` with `{ id, label, icon (IconName), href?, badge? }`; rendered as an equal-width row of icon+label tabs
- [ ] **Active state** — `active` (item id) + `onSelect`; active item highlighted and marked `aria-current="page"`
- [ ] **Fixed shell affordance** — fixed to the viewport bottom with blurred/elevated background; height from a shell size token; reads `--ss-*` so it rescales
- [ ] **Safe-area inset** — bottom padding uses `env(safe-area-inset-bottom)` for notched devices
- [ ] **Hit targets** — each tab meets the ≥44px touch-target guideline (WCAG 2.5.8) at md/lg
- [ ] **ARIA** — `<nav aria-label>` wrapping a list; links/buttons per item; `aria-current` on active
- [ ] **`size?: Size`** prop resolved via `resolveComponentSize('BottomNav', size)`
- [ ] Exported from `src/lib/index.ts` with `NavItem` type
- [ ] Tests added in `test/unit/BottomNav.svelte.test.ts`; `pnpm test` green, `pnpm pack` clean
- [ ] Docs: `BottomNav` page added to `documentation/src/lib/docs.config.ts`; `pnpm docs:test` green

## Notes
- Story: [[ds-0048-bottom-nav-component]] · Epic: [[DS-0043-new-components-from-website]].
- Source: `passoca/src/lib/components/MobileBottomNav.svelte`.
- Complements existing shell components `Topbar`/`Sidebar`; reuse `Icon.svelte` and any shared shell tokens (`--ss-shell-*`).
