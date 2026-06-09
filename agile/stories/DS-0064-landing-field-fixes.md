---
id: DS-0064
type: story
title: "Landing field fixes — independent cycling, crossfade, photos, gradient"
status: done
priority: medium
tags: [docs, landing, motion, bugfix]
depends_on: [DS-0063]
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
Fixes for the landing field reported after [[DS-0063-landing-polish]].

## Acceptance criteria
- [x] **Values cycle again, independently** — the cycler is refactored from one
  shared `$effect` (which read the resize-measured `count`, so it tore itself down
  and re-armed every measure/resize) into a per-tile component **`HubTile`**, each
  owning a local `vi = $state(0)` + its own random 0.5–2s timeout. Each tile now
  changes **independently** — no two show the same value — and is immune to the
  parent's layout/resize churn.
- [x] **Smooth value transitions** — every (non-chrome) value change **crossfades**
  (`{#key vi}` + `in/out:fade`), so the field "breathes"; chrome tiles update in
  place via their own transitions.
- [x] **Smooth hover** — tile dim→full is a clean opacity-only transition (no
  `filter` transition); no longer disabled under reduced motion.
- [x] **Darker centre** — the page radial gradient centre is now `rgba(0,0,0,.95)`
  (was `.83`), edges unchanged at `.4`.
- [x] **Real photos** — Image tiles use **random internet images** (Lorem Picsum,
  seeded for caching) at **lower opacity** (`.6`), filling their cell.
- [x] Reduced motion still freezes the field (cycler + crossfade), and tiles stay
  `inert` + `aria-hidden`.
- [x] `pnpm docs:test` green (HubTile cycler/crossfade/reduced-motion + Picsum
  contracts); `pnpm docs:build` clean.

## Notes
- The field is intentionally **frozen under `prefers-reduced-motion`** (WCAG 2.2.2);
  with that OS setting on, the components won't cycle by design.
