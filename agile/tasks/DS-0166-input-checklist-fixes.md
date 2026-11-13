---
id: DS-0166
type: task
title: "Input: Front-End Checklist fixes"
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

Fixes the Input findings from the Front-End Checklist audit (GitHub issue #139).

- **Medium · `focus-styles` (clear button, also Cross-cutting).** Fixed. The `.clear:focus-visible`
  override (`outline: none` + `box-shadow: 0 0 0 2px var(--ss-primary-soft)`, about 1.5:1) is gone,
  so the base `outline: 2px solid var(--ss-primary); outline-offset: 2px` from `_base.scss` applies.
  The rule only brightens the glyph to `--ss-fg` now.
- **Medium · `touch-targets` (clear button).** Fixed. `.clear` gets
  `min-inline-size`/`min-block-size: var(--ss-s-6)` (24px, the WCAG 2.5.8 floor), and the glyph stays
  centred at its original size. The existing `.control` gap (`--ss-gap-sm`) keeps the button apart
  from the input text.
- **Low · `logical-properties` (Cross-cutting, `.req`).** Fixed. `margin-left: 2px` becomes
  `margin-inline-start: 2px`.

Vanilla: `src/lib/vanilla/fields.ts` didn't need a change. All three fixes are CSS only, and the
generated `vanilla.css` picks them up. The DOM and class names are the same as before.

### Tests

`test/unit/Input.svelte.test.ts` has a new block, "Input styles (DS-0166)". It checks the
component source, because jsdom can't compute scoped styles. Each check fails against the old code:
- the `.clear` block contains no `--ss-primary-soft` and no `outline: none`;
- the `.clear` block declares `min-inline-size`/`min-block-size: var(--ss-s-6)` and centres the glyph;
- the `.req` block uses `margin-inline-start` and no physical margin.
