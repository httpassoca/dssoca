---
id: DS-0204
type: task
title: "Topbar: ArrowLeft/ArrowRight follow the reading direction"
status: done
priority: high
tags: [a11y, topbar, rtl, keyboard]
depends_on: []
parent: DS-0201
epic: null
created: 2026-11-25
updated: 2026-11-25
---

## Description

The tab strip's key handler treated ArrowRight as "DOM-next" in every direction. It now reads
`getComputedStyle(el).direction` at keydown and swaps Left/Right under `rtl`, as
`SegmentedControl` and `TierList` do. ArrowUp/ArrowDown, Home and End stay logical.

- Test: `Topbar.svelte.test.ts` (computed direction stubbed, since jsdom does not inherit `dir`).
