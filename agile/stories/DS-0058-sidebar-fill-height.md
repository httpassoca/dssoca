---
id: DS-0058
type: story
title: "Sidebar fills its container height"
status: done
priority: low
tags: [ui, sidebar, layout]
depends_on: []
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
The `Sidebar` rail only grew as tall as its items, so its right border and
background stopped partway down the screen, leaving a bare gap below the last
item. It should fill the full height of its host container (screen / column).

## Acceptance criteria
- [x] `.ss-side` gets `min-height: 100%` so the rail stretches to the host's
  height — the border-right and background span the full column. `min-height`
  (not `height`) keeps it growing past the viewport when the nav is long (the
  host scrolls), and it resolves to `auto` when the parent has no definite
  height, so a bare/standalone Sidebar is unaffected.
- [x] Relies on the global `box-sizing: border-box` base reset (already in
  `_base.scss`), so padding + border stay inside the 100%.
- [x] `Sidebar.svelte.test.ts` extended with a source style-contract assertion
  (jsdom can't measure layout height).
- [x] Sidebar docs note updated (`component-docs/sidebar.ts`).
- [x] `pnpm test` green; `pnpm docs:test` green; `pnpm pack` clean.

## Notes
- Library change (affects every consumer): the published `Sidebar` now fills its
  container by default. In the docs shell its host (`.nav`) already carries a
  viewport-minus-topbar height, so the rail now spans the full viewport.
