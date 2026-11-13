---
id: DS-0177
type: task
title: "Menu: Front-End Checklist fixes"
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

Front-End Checklist findings for Menu (issue #139).

- **Low · `aria-labels` (Menu:236)**: fixed. Without `label`, the `role="menu"` panel had no
  name although the docs promised a trigger-text fallback. The trigger now gets
  `id="{uid}-trigger"` and the panel gets `aria-labelledby` pointing to it whenever `label` is
  absent (an explicit `label` keeps `aria-label` and drops `aria-labelledby`). Vanilla parity:
  `vanilla/menu.ts` `openMenu` adds `aria-labelledby` → trigger (minting a trigger id if
  needed) to hand-authored panels that have neither `aria-label` nor `aria-labelledby`.
- **Low · `logical-properties` (cross-cutting, Menu:351-362)**: fixed. Panel alignment uses
  `inset-inline-start/end: 0` instead of `left/right: 0`; `.item` uses `text-align: start`. The
  focused row's inset bar (a `box-shadow`, which has no logical form) flips to the right edge
  under `:dir(rtl)`.
- **Shared decision (focus rings)**: the trigger's `:focus-visible` replaced the base outline
  with a `--ss-primary-soft` box-shadow. The override is removed so the base
  `outline: 2px solid var(--ss-primary)` ring applies (the border tint stays as an extra cue).

## Tests

- `test/unit/Menu.svelte.test.ts`: accessible name falls back to the trigger text
  (aria-labelledby), explicit `label` wins, unlabelled menu passes axe; source pins for logical
  properties and no `--ss-primary-soft`.
- `test/unit/vanilla-menu.test.ts` (new): copied unlabelled markup is named by the trigger;
  hand-authored unnamed panel gets aria-labelledby on open; authored aria-label is untouched.
