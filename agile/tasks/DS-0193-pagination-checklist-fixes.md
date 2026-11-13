---
id: DS-0193
type: task
title: "Pagination: Front-End Checklist fixes"
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

Front-End Checklist findings for Pagination (GitHub issue #139). Only the cross-cutting
RTL item applies.

### Low · `logical-properties`: physical `border-left` breaks RTL (`Pagination.svelte:148,156`)

Fixed. The cell dividers on `.page` and its `:first-child` reset now use
`border-inline-start`, and the same change was made to `.ellipsis` (a third physical
`border-left` the issue did not list). Under `dir="rtl"` the row reverses and the dividers
follow it. `dist/vanilla.css` is generated from this style block, so the plain-HTML path
picks the change up automatically. The class names and DOM are unchanged.

### The ‹ › glyphs need mirroring in RTL

Not changed, because the browser already mirrors them. U+2039 and U+203A have
`Bidi_Mirrored=Yes` and bidi class `ON` (they are listed in Unicode `BidiMirroring.txt`).
Inside an RTL button, the neutral character resolves to the RTL embedding level, and
UAX #9 rule L4 draws its mirrored glyph. So Prev, now on the right, shows ›, and Next
shows ‹. Adding `transform: scaleX(-1)` would flip them a second time, back to the wrong
direction. A source comment explains this.

### Tests (`test/unit/Pagination.svelte.test.ts`, "RTL (DS-0193)")

- The style block has no `border-left`/`border-right` and uses `border-inline-start`
  (confirmed: it fails with the old CSS).
- A guard test checks that the nav glyphs are U+2039/U+203A and that no `scaleX(-1)` or
  `rotate(180deg)` transform is present, so they are never double-mirrored.
- **Lead follow-up (focus-styles):** the page button's inset focus ring used `--ss-primary-soft` (~1.5:1); it is now a solid `inset 0 0 0 2px var(--ss-primary)`, matching the shared focus-ring rule from #139.
