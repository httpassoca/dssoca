---
id: DS-0060
type: story
title: "Docs homepage redesign — centred hero over a live component hub"
status: done
priority: high
tags: [docs, landing, motion]
depends_on: [DS-0062]
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
Replace the docs landing with a centred brand hero — **logo + DSSOCA + description
+ both CTAs** — sitting over a full-viewport **"workstation"**: a tiled field of
every component, dimmed, where each card lifts to full opacity on hover (its own
card only) and continuously mutates its own props.

## Acceptance criteria
- [x] **Hero**: inline brand mark (SVG, `fill: var(--ss-primary)` + glow), the
  `DSSOCA` wordmark, the description, and the two buttons (**Get started** →
  `/introduction`, **Browse components** → `/components`), centred, dark-first.
  The mark is inlined (no logo file ref) so the hero is independent of the
  logo-rename work and never names the author.
- [x] **Hub field** (`Hub.svelte`): a grid of fixed-size, overflow-clipped tiles,
  each a live component at `opacity: .26`, lifting to `1` on hover with a smooth
  transition — **per card only**. A `transform` on each tile contains any
  `position:fixed`/popover child (BottomNav, Menu) so it can't escape its cell.
- [x] **Constant change without layout shift**: each tile cycles its props on an
  **independent random 1–4s timer** (`setTimeout` reschedule). Pools change
  content/colour/variant only and keep lengths similar; the tile box is fixed, so
  the field never reflows. `LogStream` self-animates via `demo`.
- [x] **Reduced motion**: the cycler `$effect` early-returns under
  `prefersReducedMotion`, so the field renders a static first frame (no timers).
- [x] **SSR-safe**: the hub renders client-only (`{#if browser}`); the hero is the
  prerendered content. Tile data lives in `$lib/hub-data.ts` and is unit-tested
  (`hub-data.test.ts`: every tile is a real component slug; every component shown).
- [x] `pnpm docs:test` green; `pnpm docs:build` clean.

## Notes
- The old axes/component-grid sections are dropped — the new `/components`
  overview ([[DS-0062-docs-components-overview]]) is the catalog the **Browse
  components** button points to. This story therefore **depends on DS-0062** (the
  `/components` route must exist for prerender), and was stacked on it.
- Theme-responsive (dark by default); not hard-locked to dark, so the topbar
  theme toggle still works on the landing.
