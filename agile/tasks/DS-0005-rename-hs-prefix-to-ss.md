---
id: DS-0005
type: task
title: "Rename --hs- tokens + hub-* classes to ss-"
status: done
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
original `--hs-` CSS custom-property prefix and the global `hub-*` shell classes (e.g. `.ss-topbar`,
`.ss-panel`). For the standalone `dssoca` identity these were renamed to a neutral `ss-` prefix
(`--hs-` → `--ss-`, `hub-` → `ss-`).

This is a **breaking change** for any consumer that referenced the old tokens/classes directly. Done
in the working tree + committed; not yet published — the next npm release (≥ 0.2.0) ships it with a
migration note.

## Acceptance criteria
- [x] All `--hs-*` custom properties renamed to `--ss-*` in `src/lib/theme.css` and every component (472 refs)
- [x] All global `hub-*` classes renamed to `ss-*` in `theme.css` and component markup (166 refs)
- [x] Tests updated to the new names; `pnpm test` green (121/121)
- [x] DESIGN.md / docs / README references updated to `--ss-` / `ss-`
- [ ] Release notes flag the breaking rename when the next version is published

## Notes
- Prefix chosen: `ss-` (soca system), not `ds-` as originally scoped
- Mechanical sweep: `--hs-` → `--ss-`, `hub-` → `ss-` across `src/ test/ docs/` + README/DESIGN; prose "hub" left intact
