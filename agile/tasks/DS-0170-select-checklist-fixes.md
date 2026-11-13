---
id: DS-0170
type: task
title: "Select: Front-End Checklist fixes"
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

Fixes the Select findings from the Front-End Checklist audit (issue #139). Select had no
per-component section; only the cross-cutting RTL item names it.

- **Low · `logical-properties`, `.req { margin-left }` (Select:145).** Confirmed. Fixed by
  switching to `margin-inline-start: 2px`, so the asterisk follows the label text in RTL.
- **Low · `logical-properties`, chevron (Select:187).** Confirmed. `margin-left` became
  `margin-inline-start: var(--ss-gap-sm)`, and the triangle's `border-left`/`border-right` pair
  became `border-inline` (it is symmetric, so this is for consistency only). Under `dir="rtl"`
  the flex row reverses, so the chevron sits on the left with its gap on the select's side.

Tests: `test/unit/Select.svelte.test.ts` → "Select RTL styles" compiles the component's SCSS
and asserts there are no physical left/right properties, plus logical margins on `.req` and
`.chevron`. All three fail against the old CSS.

Docs: `documentation/src/lib/component-docs/select.ts` gains a `notes` entry on RTL.
