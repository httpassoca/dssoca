---
id: DS-0172
type: task
title: "SegmentedControl: Front-End Checklist fixes"
status: done
priority: low
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Fix the SegmentedControl findings from the Front-End Checklist audit (GitHub issue #139).

- **Medium · `focus-styles`** (cross-cutting + own section): a focused, unselected segment drew
  `inset 0 0 0 2px var(--ss-primary-soft)` (~1.5:1 dark / 1.2:1 light). Fixed: the inset ring is
  now solid `var(--ss-primary)`. The inset is kept so the ring stays inside the shared frame; the
  selected segment keeps its inset `--ss-bg` ring on the primary fill.
- **Low · `logical-properties`**: the hairline dividers used `border-left` (and `border-left: 0`
  on `:first-child`). Fixed: `border-inline-start` so dividers sit between segments in RTL.
- **Low · `keyboard-navigation` (RTL)**: ArrowLeft/ArrowRight were hard-wired to previous/next in
  `SegmentedControl.svelte` and `vanilla/segmented.ts`. Fixed in both: the handler reads
  `getComputedStyle(segment).direction` at keydown time and swaps Left/Right under `rtl`;
  Up/Down and Home/End stay logical.

Tests:

- `test/unit/SegmentedControl.svelte.test.ts`: RTL ArrowLeft → next, ArrowRight → previous
  (wrapping), Up/Down logical under RTL; style-source checks (no `--ss-primary-soft`, solid inset
  `--ss-primary` ring, no physical `border-left/right`, `border-inline-start` dividers).
- `test/unit/vanilla-segmented-control.test.ts` (new): vanilla RTL Left/Right mirroring, Up/Down
  logical, LTR unchanged.

Docs: `documentation/src/lib/component-docs/segmented-control.ts` notes + htmlExample note.
