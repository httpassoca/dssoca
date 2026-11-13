---
id: DS-0162
type: task
title: "Accordion: Front-End Checklist fixes"
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

Front-End Checklist audit (issue #139) findings for Accordion.

### High · `accordion-accessibility`, `aria-hidden-focus` — fixed

Confirmed: `.panel[hidden] { display: grid }` beat the UA `display: none`, so a closed panel was only
clipped to 0 height; its content stayed in the accessibility tree and focusable descendants were
still reachable with Tab.

- `Accordion.svelte`: closed panels now get `inert` (`inert={!expanded}`) and
  `visibility: hidden`. The visibility switch is delayed by `--ss-dur` on close and instant on open
  (the Menu/Tooltip pattern), so the grid-rows collapse still animates with the content painted.
- `vanilla/accordion.ts`: `setOpen` toggles `inert` alongside `hidden`. The visibility CSS reaches
  `vanilla.css` through the generator, so plain-HTML pages are covered even without `inert` in their
  markup.

### Extra (not in the issue) — RTL

- `.head` used `text-align: left`; changed to `text-align: start` (shared logical-properties rule).

### Tests

- `test/unit/Accordion.svelte.test.ts`: closed panels are `inert`, open ones are not, and the state
  follows toggling; CSS contract for `visibility: hidden` / `visible` with the delayed close
  transition.
- `test/unit/vanilla-accordion.test.ts` (new): the rendered markup contract ships closed panels
  `inert`; the vanilla behaviour toggles `inert` together with `hidden`.
- Both test files reflect jsdom's missing `inert` IDL property onto the attribute (Svelte sets it as
  a property).
