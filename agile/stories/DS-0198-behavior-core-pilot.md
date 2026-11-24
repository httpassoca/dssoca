---
id: DS-0198
type: story
title: "Behaviour core pilot — Menu and Switch on a shared core"
status: in-progress
priority: high
tags: [ui, architecture, menu, switch, vanilla]
depends_on: []
parent: null
epic: DS-0197
created: 2026-11-24
updated: 2026-11-24
---

## Description

As the maintainer I want Menu and Switch to take their behaviour from one shared core, so a
keyboard or dismissal fix lands once and the Svelte and plain-HTML paths cannot drift. The pilot
sets the shape every later component copies; it stops for the owner's review before the rest.

- `src/lib/core/behaviors/roving.ts` — roving focus index maths.
- `src/lib/core/menu.ts`, `src/lib/core/switch.ts` — events in, actions and attributes out.
- `Menu.svelte` / `Switch.svelte` and `vanilla/menu.ts` / `vanilla/switch.ts` reduced to wiring.
- `toast-core.ts`, `tierlist-core.ts`, `chart-nav.ts` moved to `src/lib/core/`.
- New: `Menu` `onOpenChange(open, { reason })` + `ss:openchange`; `Switch` `onchange` /
  `ss:change` carry `reason`.

## Acceptance criteria

- [x] Menu and Switch decide nothing about keys or toggling outside `core/`.
- [x] Rendered DOM unchanged (attribute values identical; existing tests untouched except the
      Switch `onchange` assertions, which now also receive `details`).
- [x] Core unit tests (`core-roving`, `core-menu`, `core-switch`), purity test, key-handling guard.
- [x] Documentation updated (Menu and Switch component pages, CLAUDE.md, CHANGELOG).
- [ ] Owner reviewed the core's shape.
- [ ] Browser pass (both themes, `dir="rtl"`) — deferred to the end of the epic, markup and
      styles are untouched.

## Notes

- Plain-HTML Menu: an item with only `aria-disabled="true"` is no longer activated by a click
  (the Svelte component and the keyboard already skipped it).
- Verify: `pnpm test`, `pnpm docs:test`, `pnpm check`, `pnpm pack`.
