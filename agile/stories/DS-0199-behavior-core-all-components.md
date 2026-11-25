---
id: DS-0199
type: story
title: "Behaviour core — every existing interactive component on it"
status: in-progress
priority: high
tags: [ui, architecture, vanilla, a11y]
depends_on: [DS-0198]
parent: null
epic: DS-0197
created: 2026-11-24
updated: 2026-11-24
---

## Description

As the maintainer I want every interactive component to take its decisions from `src/lib/core/`,
so no `.svelte` file or `vanilla/*.ts` module decides what a key or a press does on its own.

Migrated after the pilot: Accordion, SegmentedControl, Modal, Tooltip, Input, NumberField
(+ `vanilla/fields.ts`), FileDrop, Pagination, Table, Image, BottomNav, SearchPalette, Sidebar,
Topbar, ShortcutsHelp, Chart, BoxPlot, BumpChart, ScatterPlot, Heatmap, TierList, Toaster,
LogStream. Left without a core because they make no behaviour decision: Select and DateField
(bare native inputs) and Textarea (only measures its height).

New `details.reason`: Modal `onclose` (+ new `ss:close`), SearchPalette `onopen`/`onclose`,
SegmentedControl `onChange`, Pagination `onchange`, FileDrop `onfiles`, TierList `onchange`.

## Acceptance criteria

- [x] The key-handling guard has no legacy list left: no component and no vanilla module
      compares `event.key`.
- [x] Rendered DOM, classes and existing `ss:*` events unchanged.
- [x] One `core-<component>.test.ts` per new core.
- [x] Documentation updated (component pages for every new `details.reason`, CHANGELOG).
- [ ] Browser pass (both themes, `dir="rtl"`): Escape reasons on Modal and SearchPalette rely
      on the native dialog `cancel` event and were only exercised in jsdom.

## Notes

- Follow-ups found on the way, not done here: ShortcutsHelp should forward Modal's close reason
  through an `onOpenChange`; Topbar's tab arrows do not swap under `dir="rtl"` (pre-existing);
  the Tab trap in `core/image.ts` could become a shared `core/behaviors/` piece; the charts
  disagree on what Escape does (kept as is, per chart).
- Plain-HTML edge cases that changed are listed in the CHANGELOG under "Changed".
