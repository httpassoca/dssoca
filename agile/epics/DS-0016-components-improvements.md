---
id: DS-0016
type: epic
title: "Components improvements — best-in-class pass"
status: in-progress
priority: high
tags: [ui, epic, quality]
depends_on: []
parent: null
epic: null
created: 2026-06-08
updated: 2026-06-08
---

## Description
Lift every shipped component from "thin wrapper / demo" toward a best-in-class equivalent. Each
component was researched against mature design systems (Radix/shadcn, Carbon, Polaris, Primer,
Material) and data-viz/dashboard references. This epic groups one **story per component** (the
user-facing need) and a single **task per component** whose acceptance criteria enumerate the
concrete props/states/behaviours to add. Scope is API + behaviour + a11y enrichment, honouring the
house rules: **zero border-radius**, `--ss-*` tokens (new chrome must rescale across sm/md/lg),
`.ss-*` identity prefix, scoped styling, Svelte 5 runes, and WCAG 2.2 AA.

A few items are outright bug/house-rule fixes surfaced by the research (flagged `high`):
Sparkline's `size` prop is inert, Badge's `hasDot` is dead logic, Card's root is `.ss-panel`
with an inline hardcoded `12px`, ServiceCard hardcodes `#232323`, and LogStream hardcodes
`#0a0a0a` and force-scrolls.

## Acceptance criteria
- [ ] All 13 component stories (DS-0017 → DS-0029) and their tasks (DS-0030 → DS-0042) triaged and scheduled
- [ ] Each change is non-breaking where feasible (additive props/defaults preserve current behaviour)
- [ ] Per the testing RULE: every implemented task extends `test/unit/` (+ harness) and keeps `pnpm test` green / `pnpm pack` clean
- [ ] Storybook stories added/updated for the new states (a separate follow-up may track the story files)
- [ ] Board rebuilt (`node build.mjs`) as items move

## Notes
- These items are **created, not started** — tasks only, per the owner's request. No code changes yet.
- Component research is summarised in each task's acceptance criteria.
- Relates to the prior a11y pass [[DS-0013-accessibility-pass]] and the size system [[DS-0012-config-driven-size-system]].
