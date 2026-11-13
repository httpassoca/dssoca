---
id: DS-0189
type: task
title: "TierList: Front-End Checklist fixes"
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

Front-End Checklist findings for TierList (issue #139).

- **Low · `reduced-motion`** (`TierList.svelte` `animate:flip`): fixed. The flip duration is
  now `prefersReducedMotion.current ? 0 : 150` (`svelte/motion`, as in Toaster); a zero duration
  makes Svelte skip `element.animate()` entirely. Vanilla has no flip animation, so nothing to
  mirror.
- **Low · `keyboard-navigation` (RTL)** (`tierlist-core.ts` keyboard target + pointer
  insertion index): fixed. `TierListKeyMove` now speaks in reading order (`prev`/`next` instead
  of `left`/`right`), and the new `keyMoveFor(key, rtl)` maps the arrow keys onto it, swapping
  Left/Right under RTL. `insertionIndex(cells, x, y, rtl)` counts tiles whose centre is right of
  the pointer when the row is RTL. Both `TierList.svelte` and `vanilla/tierlist.ts` read
  `getComputedStyle(el).direction === 'rtl'` at event time (keydown on the tile, pointermove on
  the zone). Also `.tile { text-align: left }` → `start`.

### Tests

- `test/unit/tierlist-core.test.ts`: `keyMoveFor` mapping (LTR/RTL); RTL `insertionIndex`.
  Existing `keyboardTarget` cases renamed to `prev`/`next`.
- `test/unit/TierList.svelte.test.ts`: "TierList — RTL" (mirrored arrows; pointer reorder in a
  right-to-left row).
- `test/unit/TierList.reduced-motion.svelte.test.ts` (new): flip calls `animate()` by default and
  not when `prefersReducedMotion` is on (store mocked).
- `test/unit/vanilla-tier-list.test.ts` (new): vanilla RTL arrows and pointer insertion.

All new tests were confirmed failing with the fixes reverted.
