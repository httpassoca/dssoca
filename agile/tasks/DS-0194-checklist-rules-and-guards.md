---
id: DS-0194
type: task
title: "Record the audit rules for future work + repo-wide guard test"
status: done
priority: high
tags: [a11y, docs, tests, process]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

So the #139 findings don't come back, the rules behind them are now part of the standing process:

- `CLAUDE.md` → **Accessibility & quality rules** (focus, names/roles/states, live regions,
  keyboard, layout/colour/motion, safety & defaults, process), linked from the Tests rule and from
  "Adding / changing a component". `CONTRIBUTING.md` points to it from the house rules.
- `test/unit/checklist-guards.test.ts` scans every component's style/markup and fails on the
  mechanical regressions: `--ss-primary-soft` in a `:focus-visible` rule, physical
  margin/padding/border/text-align, opacity-muted toggle text, and `role="button"` on SVG data marks.
- `ShortcutsHelp.svelte`: one remaining `margin-left` → `margin-inline-start` (found by the guard).
