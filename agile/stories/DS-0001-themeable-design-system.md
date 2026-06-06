---
id: DS-0001
type: story
title: "Themeable design system: color + density axes"
status: done
priority: high
tags: [ui, theme]
depends_on: []
parent: null
epic: null
created: 2026-06-05
updated: 2026-06-06
---

## Description
As an app author, I import one `theme.css` and get a coherent look (signal green on
near-black, monospace-forward) configured along two orthogonal axes — color
(`dark`/`light`) and density (`comfy`/`compact`) — so a content app and the dense
hub dashboard share tokens without forking styles.

## Acceptance criteria
- [x] Color axis via `data-theme` (`dark` default · `light`) swaps surface/foreground tokens only
- [x] Density axis via `data-density` (`comfy` default · `compact`) rescales chrome paddings/gaps/heights, not colors or content typography
- [x] All four combinations (dark/comfy, dark/compact, light/comfy, light/compact) are valid and cascade from any ancestor (usually `<html>`)
- [x] `applyDesignConfig({ theme, density })` merges over current config and writes to `<html>` at runtime
- [x] `designAttributes({ ... })` returns SSR-safe attributes to spread in markup (no hydration flash)
- [x] Zero border-radius on every token (house rule, never overridden)

## Notes
- `src/lib/theme.css` (exported as `dssoca/theme.css`) — token source of truth
- `src/lib/config.ts` — `applyDesignConfig` / `designAttributes`, re-exported from package root
- Content typography (`h1`–`h3`, `--hs-size-*`, `--hs-s-*`) is density-independent; only `--hs-leading` differs (1.5 comfy / 1.3 compact)
- See `DESIGN.md` + `docs/themes.md` / `docs/tokens.md`
