---
id: DS-0128
type: story
title: "Component sweep — color-mix washes + shared CHART_PALETTE"
status: done
priority: high
tags: [components, colors, charts, refactor]
depends_on: [DS-0126]
parent: null
epic: DS-0125
created: 2026-07-09
updated: 2026-07-09
---

## Description

As a maintainer, I want zero raw color literals and zero duplicated palettes in component code, so
theme flips and imported palettes recolor every component and the categorical palette is defined
once.

## Acceptance criteria

- [x] `Topbar.svelte` hardcoded `rgba(102, 239, 115, .06)` active wash (the one pre-rework token
      violation) → `color-mix(in srgb, var(--ss-accent) 6%, transparent)`; same pattern replaces
      `rgba(var(--ss-primary-rgb), .06)` in Menu / Sidebar / BottomNav.
- [x] The five form fields' invalid focus ring `rgba(var(--ss-red-rgb), .22)` →
      `color-mix(in srgb, var(--ss-danger) 22%, transparent)` (sentiment token, matching
      `--ss-danger-soft` intent).
- [x] The 6-color categorical palette duplicated in Chart / ScatterPlot / BoxPlot / BumpChart /
      Avatar extracted to `src/lib/palette.ts` (`CHART_PALETTE`, barrel-exported) and remapped to
      slots: `[accent, blue, magenta, cyan, yellow, green]`. Order/length documented as stable API
      (Avatar's name-hash → color mapping).
- [x] Avatar test asserts against `CHART_PALETTE` + pins length 6.
- [x] No `var(--ss-purple)` / `var(--ss-lime)` consumers left in `src/lib`.
