---
id: DS-0163
type: task
title: "Tooltip: Front-End Checklist fixes"
status: done
priority: high
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Fixes the Tooltip findings from the Front-End Checklist audit (GitHub issue #139).

### High: `accessible-tooltips`, `aria-tooltip-name`. Fixed
`aria-describedby` sat on the non-focusable wrapper `<span>`, so screen readers never read the
tip. `Tooltip.svelte` now adds the tip id as one token to `aria-describedby` on the focused
trigger (focusin target), or, when opened by hover, on the first focusable element in `.trigger`
(falling back to its first element). Existing tokens on the trigger (e.g. a field hint) are kept,
and the id is removed on close and on unmount. Mirrored in `vanilla/tooltip.ts`
(`showTooltip(root, from?)`). The wrong assertion in `Tooltip.svelte.test.ts` (old line 48) now
checks the trigger and its accessible description.

### Medium: `accessible-tooltips` (WCAG 1.4.13). Fixed
- Escape: a document-level `keydown` listener is attached while the tip is open, so a
  hover-opened tip closes wherever focus is. Vanilla installs one document listener that closes
  every open `.ss-tooltip > .tip.open`.
- Hoverable: `.tip.open` now has `pointer-events: auto`, and a `.tip::before` bridge covers the
  `--ss-tooltip-offset` gap on the trigger-facing side, so the pointer can move onto the tip
  without leaving the wrapper.

### Tests
- `test/unit/Tooltip.svelte.test.ts`: describedby on the focused trigger (not the wrapper) plus
  accessible description, on hover, merging with and restoring the trigger's own tokens, cleanup
  on unmount, document-level Escape for a hover-opened tip, other keys/closed state ignored.
- `test/unit/vanilla-tooltip.test.ts` (new): the same describedby wiring and document Escape for
  the vanilla layer.
- Hover onto the tip needs a real-browser check (jsdom has no hit testing).
