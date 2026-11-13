---
id: DS-0174
type: task
title: "Link: Front-End Checklist fixes"
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

Front-End Checklist findings for `Link` (issue #139).

- **Medium · `link-in-text-block`** — fixed. The inline variant's `.label::after` underline is
  now visible at rest (1px, `scaleX(1)`) and thickens to 2px with the glow on hover/focus, so
  inline links are no longer told apart by colour alone on the tokens.css-only path. The
  component also cancels theme.css's global `a::before` underline (`.ss-link::before { content:
  none }`) so only one line shows when theme.css is loaded. Positioning uses `inset-inline: 0`.
- **Low · `new-tab`** — fixed. `noopener noreferrer` and the "(opens in a new tab)" hint now
  follow the resolved target (`_blank`), not `isExternal`, so an explicit `target="_blank"` gets
  them too and an external link forced to `_self` drops the hint. A custom `rel` is merged with
  the security tokens (no duplicates) instead of replacing them. The external glyph stays tied
  to `isExternal`.

Tests (`test/unit/Link.svelte.test.ts`): explicit `_blank` gets rel + hint; custom rel merges;
no duplicate tokens; `_self` override drops the hint; compiled CSS has a resting 1px underline
(no `scaleX(0)`) and a `.ss-link::before { content: none }` reset.
