---
id: DS-0090
type: epic
title: "geossoca component gaps — components the score-tracker app needs"
status: in-progress
priority: high
tags: [ui, epic, components, adoption]
depends_on: []
parent: null
epic: null
created: 2026-06-15
updated: 2026-06-15
---

## Description
The `geossoca` GeoGuessr score-tracker app (a new SvelteKit + dssoca consumer) needs several
components the design system does not yet ship. Rather than build them locally in the app, they are
added to dssoca so any future consumer benefits. This epic groups the eleven resulting component
tasks: **Chart** (D3-backed, the app's performance graphs), **Table** (rankings), **Select**,
**Modal**, **DateField**, **FileDrop** (JSON import/export + game entry), and the good-to-have
**NumberField**, **Tooltip**, **Avatar**, **Pagination**, and **Switch** (theme toggle).

`Chart` introduces the design system's first runtime dependencies — the modular `d3-scale`,
`d3-shape`, `d3-array` packages. Every other component stays dependency-free.

Each component honours the house rules: **zero border-radius**, `--ss-*` tokens, `.ss-*` identity
prefix, scoped SCSS, Svelte 5 runes, WCAG 2.2 AA, and the tests/docs/agile RULEs.

## Acceptance criteria
- [ ] All child tasks (DS-0091 … DS-0101) are done.
- [ ] Each component ships source + Storybook story + Vitest/axe test + docs page, wired into the
      barrel, `COMPONENT_NAMES`, and the docs index.
- [ ] `pnpm test`, `pnpm check`, and `pnpm pack` stay green.
- [ ] Board rebuilt (`node build.mjs`) as items move.

## Notes
- Consumer: the `geossoca` app (`/home/passoca/dev/geossoca`) — score tracking with JSON
  import/export, two rankings (position + points), and D3 performance graphs.
- Sibling epics: [[DS-0043-new-components-from-website]] and [[DS-0079-passoca-adoption-gaps]].
- Tasks: [[DS-0091-chart-implementation]], [[DS-0092-table-implementation]],
  [[DS-0093-select-implementation]], [[DS-0094-modal-implementation]],
  [[DS-0095-date-field-implementation]], [[DS-0096-file-drop-implementation]],
  [[DS-0097-number-field-implementation]], [[DS-0098-tooltip-implementation]],
  [[DS-0099-avatar-implementation]], [[DS-0100-pagination-implementation]],
  [[DS-0101-switch-implementation]].
