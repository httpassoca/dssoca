---
id: DS-0047
type: story
title: "SegmentedControl component"
status: backlog
priority: low
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want a **SegmentedControl** (toggle group) — a compact row of mutually-exclusive
options with a highlighted selection — so I can offer view/mode/locale toggles without a full Dropdown or
loose radio buttons. The website's `LanguageSwitcher.svelte` is the compact inline form of this (EN/PT
border buttons with an active state); a design-system version should generalize it to N options with
proper keyboard navigation and a bindable value.

## Acceptance criteria
- [ ] `SegmentedControl` gains the behaviour tracked in [[ds-0053-segmented-control-implementation]] (the per-component task)
- [ ] Changes are additive — new file + barrel export; no existing component touched
- [ ] New chrome reads `--ss-*` size tokens and respects zero border-radius
- [ ] WCAG 2.2 AA upheld (radiogroup/tablist semantics + arrow-key nav); `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0043-new-components-from-website]].
- Concrete work is the single task [[ds-0053-segmented-control-implementation]]; the detailed checklist lives there.
- Source: `passoca/src/lib/components/LanguageSwitcher.svelte`.
