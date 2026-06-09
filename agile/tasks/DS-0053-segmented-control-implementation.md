---
id: DS-0053
type: task
title: "SegmentedControl implementation"
status: backlog
priority: low
tags: [ui, a11y]
depends_on: []
parent: DS-0047
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
Build a new `SegmentedControl` component at `src/lib/components/SegmentedControl.svelte`, generalizing the
website's `LanguageSwitcher.svelte` (compact EN/PT toggle) into an N-option control. Keep it token-driven
(zero radius, `--ss-*` size tokens, scoped SCSS, Svelte 5 runes).

## Acceptance criteria
- [ ] **Options model** — `options: SegmentOption[]` with `{ value, label, icon?, disabled? }`; renders a row of segments
- [ ] **Selection** — `value` bindable + `onChange`; selected segment visually highlighted (token-driven fill, zero radius)
- [ ] **Keyboard + ARIA** — `role="radiogroup"` with `role="radio"` segments (or `tablist`/`tab` when used for views); arrow keys move + select, roving tabindex
- [ ] **Density** — compact by default; segment padding/typography from size tokens so it rescales across sm/md/lg
- [ ] **`fullWidth?`** — segments stretch to fill container (equal widths) vs hug content
- [ ] **`size?: Size`** prop resolved via `resolveComponentSize('SegmentedControl', size)`
- [ ] Exported from `src/lib/index.ts` with `SegmentOption` type
- [ ] Tests added in `test/unit/SegmentedControl.svelte.test.ts`; `pnpm test` green, `pnpm pack` clean
- [ ] Docs: `SegmentedControl` page added to `documentation/src/lib/docs.config.ts`; `pnpm docs:test` green

## Notes
- Story: [[ds-0047-segmented-control-component]] · Epic: [[DS-0043-new-components-from-website]].
- Source: `passoca/src/lib/components/LanguageSwitcher.svelte`.
- Pick radiogroup vs tablist semantics based on intended use; document both patterns.
