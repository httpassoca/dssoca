---
id: DS-0065
type: story
title: "Landing field refinements — opacity, scrim, no image, entrance, types"
status: done
priority: high
tags: [docs, landing, motion, typescript]
depends_on: [DS-0064]
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
Follow-up refinements to the landing field ([[DS-0064-landing-field-fixes]]).

## Acceptance criteria
- [x] **Tile default opacity `0.20`** (was `0.28`).
- [x] **Gradient spans the whole screen** as a dedicated full-screen scrim layer
  (`.scrim`, `position:absolute; inset:0`) centred on the hero, **over** the dimmed
  field but **under** a hovered tile (`z:2 < 5`), so a hovered card still pops to
  full. Centre darkened to `rgba(0,0,0,.95)`.
- [x] **Image dropped from the landing** — the `image` component is removed from the
  field (`ALL_SLUGS`), the Picsum images are gone, and the `<img>` tile branch is
  removed. (It still appears on the `/components` catalog.)
- [x] **Entrance transition** — tiles **fade + scale in on mount, staggered** (a
  random per-tile delay) via a CSS `tile-in` keyframe with `backwards` fill (so
  `:hover` still works after); the initial content crossfade is suppressed so only
  the tile entrance plays. Disabled under reduced motion.
- [x] **Richer hub-data** — most content pools doubled (8–10 variants each) for more
  variety.
- [x] **TypeScript correctness** — variants are a typed `Variant` interface (no
  `any`); `HubTile` reads its `slug` prop via `$derived`; the sub-data uses the real
  dssoca types (`SideGroup`, `BottomNavItem`, `MenuItem`, …). Fixed a real bug: the
  `BottomNav` default item used an invalid icon `'flex'` → `'database'` (lib + story
  + test). Added `@types/node` to the docs workspace (its tsconfig referenced `node`
  types that weren't installed) — `svelte-check` on the docs dropped 18→7 errors / 3→0
  warnings; the 7 remaining are a **pre-existing** repo-wide rune-types quirk on
  `Image.svelte` `$state<T>()` (correct code; the library `pnpm check` flags it too;
  CI doesn't run the check).
- [x] `pnpm docs:test` (32) + `pnpm test` (502) green; `pnpm docs:build` clean.

## Notes
- Debug `console.log`s left in `HubTile` during testing were removed.
- The field still freezes + stays `inert` under reduced motion.
