---
id: DS-0063
type: story
title: "Landing polish — full-screen, screen-filling field, adapted chrome"
status: done
priority: low
tags: [docs, landing, motion]
depends_on: [DS-0060]
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
Follow-up adjustments to the landing ([[DS-0060-docs-home-redesign]]).

## Acceptance criteria
- [x] **Full screen** — the `/` route renders **without the docs shell** (no top bar
  / sidebar): `+layout.svelte` branches on `isLanding` and renders the page bare;
  `.landing` is `position: fixed; inset: 0`.
- [x] **~5 tiles per row at 1920px** — grid `minmax(360px, 1fr)`.
- [x] **Field fills the screen, randomly, with repeats** — `buildTilePool(n)` builds a
  shuffled pool (every component at least once, then random repeats); the Hub measures
  the viewport and renders just enough tiles (`cols × rows`, capped at 64) to fill it.
- [x] **Adapted chrome** — sidebar fills its cell as a full nav panel (width+height
  override), topbar pins to the top edge full-width, log-stream fills, bottom-nav sits
  at the bottom (`data-slug` selectors; the component may shrink to fit).
- [x] **Hero** — logo + `DSSOCA` **side by side** (`.brand` row); clear spacing
  (`--ss-s-8`) between the description and the buttons; a `text-shadow` halo on the
  description so it stays legible over a bright hovered tile.
- [x] **Background** — `radial-gradient(circle, rgba(0,0,0,.83) 0%, rgba(0,0,0,.4) 100%)`
  behind the dimmed tiles, so a hovered tile becomes opaque and **pops to full** (no
  scrim over it). `data-theme` pinned dark on the landing.
- [x] **Cadence** — prop cycling is now **0.5–2s** (`CYCLE_MIN`/`CYCLE_MAX`).
- [x] **Mobile** — the component field is hidden below 640px (hero only).
- [x] `pnpm docs:test` green; `pnpm docs:build` clean.

## Notes
- The field stays client-only + `inert` + reduced-motion-frozen (carried from DS-0060).
