---
id: DS-0183
type: task
title: "Card: Front-End Checklist fixes"
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

Front-End Checklist findings for `Card` from issue #139.

### Medium · `keyboard-navigation` / `aria-roles` (nested interactive) — fixed

A card with `onclick` (and no `href`) used to put `role="button" tabindex="0"` plus click and
keydown handlers on the root. That flattened the heading and the `action` controls into one
button, and Enter/Space on a nested control bubbled up and fired the card's `onclick`. The
root is now never interactive. An `onclick` card renders a stretched
`<button type="button" class="overlay">`, the same pattern the `href` path already uses with
`<a class="overlay">`. It is named by the title through `aria-labelledby`, or "Open" when the
card has no title. Native button activation replaces the custom keydown handler, which has been
removed. The overlay's focus ring is drawn on its stretched `::after`
(`outline: 2px solid var(--ss-primary); outline-offset: -2px`), because the control itself has
no visible box. This also gives the `href` overlay a visible ring.

### Low · `aria-allowed-attr` — fixed

A titled card put `aria-labelledby` on a role-less `<div>`. The root now gets `role="region"`
whenever a title is set, so it is a named region. An untitled card has no role and no label.

### Tests (`test/unit/Card.svelte.test.ts`)

- A titled card is `role="region"` named by its title.
- An `onclick` card renders `button.overlay` named by the title. The root has no tabindex and is
  not a button, and the heading and the action sit outside the button.
- Enter/Space on a nested action control doesn't call `onclick`.
- An untitled clickable card falls back to "Open" as the overlay's name.
- When both `href` and `onclick` are set, there is one `<a>` overlay and `onclick` runs as its
  click handler.
- The old `role="button"` root test was replaced.

Five of these fail against the previous component, and all 29 pass now.
