---
id: DS-0050
type: task
title: "Dropdown / Menu implementation"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: DS-0044
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
Build a new `Menu` (Dropdown) component at `src/lib/components/Menu.svelte`, generalizing the three
hand-rolled popovers on the website (`ThemeMenu`, `LanguageMenu`, `FloatNavButton`). Keep it token-driven
(zero radius, `--ss-*` size tokens, scoped SCSS, Svelte 5 runes). Each acceptance-criteria line is one
concrete prop/state/behaviour.

## Acceptance criteria
- [x] **Trigger + panel** — a trigger snippet/button toggles a floating panel; panel rendered with the popover shadow token (`--ss-shadow-pop`), zero radius
- [x] **Items model** — `items: MenuItem[]` with `{ id, label, icon?, disabled?, selected?, onSelect }`; render a checkmark/active marker for `selected`
- [x] **Open/close control** — `open` bindable + uncontrolled fallback; close on item select, click-outside, and `Esc`
- [x] **Keyboard nav** — roving focus with `ArrowUp`/`ArrowDown`/`Home`/`End`, `Enter`/`Space` to activate; focus returns to trigger on close
- [x] **ARIA** — trigger `aria-haspopup="menu"` + `aria-expanded`/`aria-controls`; panel `role="menu"`, items `role="menuitem"` (or `menuitemradio` when selectable)
- [x] **Placement** — `align` (start|end) and `side` (bottom|top); reads size tokens so it rescales across sm/md/lg
- [x] **`size?: Size`** prop resolved via `resolveComponentSize('Menu', size)` (`src/lib/config.ts`)
- [x] Exported from `src/lib/index.ts` with `MenuItem` type
- [x] Tests added in `test/unit/Menu.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean
- [x] Docs: `Menu` page added to `documentation/src/lib/docs.config.ts` (`COMPONENTS`); `pnpm docs:test` green

## Notes
- Story: [[ds-0044-dropdown-menu-component]] · Epic: [[DS-0043-new-components-from-website]].
- Sources: `passoca/src/lib/components/{ThemeMenu,LanguageMenu,FloatNavButton}.svelte`.
- Consider whether `Topbar`'s existing command-menu affordance should later consume this primitive (follow-up, not this task).
