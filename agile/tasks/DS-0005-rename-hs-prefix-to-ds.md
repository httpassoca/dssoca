---
id: DS-0005
type: task
title: "Rename --hs- tokens + hub-* classes to ds-"
status: backlog
priority: low
tags: [ui, theme, breaking]
depends_on: []
parent: DS-0001
epic: null
created: 2026-06-06
updated: 2026-06-06
---

## Description
The design system was extracted from the `hubssoca` monorepo as a lift-and-shift, keeping the
original `--hs-` CSS custom-property prefix and the global `hub-*` shell classes (e.g. `.hub-topbar`,
`.hub-panel`). For the standalone `dssoca` identity these should be renamed to a neutral `ds-`
prefix. Deferred deliberately so the first extraction stayed zero-risk and the hub kept working.

This is a **breaking change** for any consumer that references the tokens/classes directly — ship it
as its own minor/major release with a migration note, not folded into an unrelated change.

## Acceptance criteria
- [ ] All `--hs-*` custom properties renamed to `--ds-*` in `src/lib/theme.css` and every component
- [ ] All global `hub-*` classes renamed to `ds-*` in `theme.css` and component markup
- [ ] Tests updated to the new names; `pnpm test` green
- [ ] DESIGN.md / docs / README references updated to `--ds-` / `ds-`
- [ ] CHANGELOG / release notes flag the breaking rename + migration mapping

## Notes
- Touches `src/lib/theme.css` (token + class source of truth) + all 14 components + the Vitest suite
- Mechanical rename — a scripted `--hs-` → `--ds-` / `hub-` → `ds-` sweep, then verify tests
- Do AFTER the design system is set up/published (it is, as `dssoca` v0.1.0)
