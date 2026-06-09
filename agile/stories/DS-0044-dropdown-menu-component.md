---
id: DS-0044
type: story
title: "Dropdown / Menu component"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want a **Dropdown / Menu** primitive — a trigger button that opens a floating
panel of selectable items — so I can build theme pickers, language switchers, overflow menus, and
floating-nav menus without re-implementing popover, focus, and keyboard logic each time. The website
hand-rolls this same pattern three times (`ThemeMenu.svelte`, `LanguageMenu.svelte`, and the menu inside
`FloatNavButton.svelte`), each with its own click-outside, scale/fade animation, active-item checkmark,
and `aria-expanded` wiring — exactly the duplication a design-system primitive removes.

## Acceptance criteria
- [x] `Menu` (Dropdown) component gains the behaviour tracked in [[ds-0050-dropdown-menu-implementation]] (the per-component task)
- [x] Changes are additive — new file + barrel export; no existing component touched
- [x] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [x] WCAG 2.2 AA upheld; `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0043-new-components-from-website]].
- Concrete work is the single task [[ds-0050-dropdown-menu-implementation]]; the detailed checklist lives there.
- Source: `passoca/src/lib/components/ThemeMenu.svelte`, `LanguageMenu.svelte`, `FloatNavButton.svelte`.
