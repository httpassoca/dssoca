---
id: DS-0129
type: story
title: "Docs Theme Builder — interactive palette generator page"
status: done
priority: high
tags: [documentation, theming, colors, feature]
depends_on: [DS-0126, DS-0127]
parent: null
epic: DS-0125
created: 2026-07-09
updated: 2026-07-10
---

## Description

As a dssoca consumer, I want an interactive Theme Builder in the documentation app where I pick an
accent color and get the full 16-slot palette (both themes) generated with the mono rules, preview
it on real components, check WCAG legibility, and export it in the formats the DS imports.

Implementation (documentation app only): pure modules under `src/lib/theme-builder/` (derive /
checks / export / presets — reusing `scripts/lib/palette.mjs`, the exact math the shipped defaults
were generated with), dssoca-dogfooding UI components, `/theme-builder` route + NAV entry.

## Acceptance criteria

- [x] Accent picker (color input + hex echo), tint + neutral-tint sliders, preset accents
      (Lime default `#66ef73`, Blue, Amber, Coral, Violet), dark/light preview toggle.
- [x] 19-slot grid with per-slot hex override editing (reset, edited badges).
- [x] Live preview of real dssoca components under scoped slot overrides
      (`data-theme` + inline custom properties on the preview container only).
- [x] Corrector panel (both themes always): fg 7:1, bright-black 4.5:1, accent 3:1,
      label-on-accent 4.5:1, six hue slots 3:1, red↔green ≥45°; one-click OKLCH-lightness fixes.
- [x] Exports v1: `applyDesignConfig({ palette })` TS snippet + CSS override block (registry
      shaped so terminal formats can be appended later — see [[DS-0131-terminal-theme-exports]]).
- [x] "Try it on this page" toggle (site-wide apply, teardown on toggle-off).
- [x] Pure-logic node tests (derive invariants, checks/fixes, export snapshots) keep
      `pnpm docs:test` green; docs build (prerender) + check green.
