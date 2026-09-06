---
id: DS-0149
type: story
title: "Remove the deprecated theme.css layout .ss-table class"
status: todo
priority: low
tags: [css, breaking, cleanup]
depends_on: [DS-0148]
parent: null
epic: null
created: 2026-09-04
updated: 2026-09-04
---

## Description

As a maintainer, I want the one-minor deprecation window honoured: the global `.ss-table` layout
class in `src/styles/_layout.scss` (a pre-component relic that shares its name with the `Table`
component's root) was deprecated in 0.17.0 ([[DS-0148-vanilla-html-consumption]]) and must be
deleted in 0.18.0, with the removal called out in the CHANGELOG.

## Acceptance criteria

- [ ] `.ss-table { … }` block removed from `src/styles/_layout.scss` (the `.ss-*` layout list in
  `CLAUDE.md`/docs updated if it is mentioned).
- [ ] `test/unit/vanilla-css.test.ts` Table-specificity guard retired or re-scoped (it exists only
  to beat the layout rules).
- [ ] CHANGELOG `### Removed` entry flagged **BREAKING**; `docs/themes.md` untouched unless it lists
  layout classes.
- [ ] `pnpm test`, `pnpm docs:test`, `pnpm pack` green.

## Notes

- Same pattern as [[DS-0130-alias-removal-next-minor]] (deprecate one minor, remove the
  next).
