---
id: DS-0169
type: task
title: "DateField: Front-End Checklist fixes"
status: done
priority: low
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Front-End Checklist audit (GitHub issue #139) listed DateField as clean except for the
shared cross-cutting RTL item.

- **Low · `logical-properties`** (`DateField.svelte:118`): the required asterisk `.req`
  used `margin-left: 2px`, which puts the gap on the wrong side in RTL. Fixed: now
  `margin-inline-start: 2px`. No API or markup change, so the docs page is unchanged.

### Tests

- `test/unit/DateField.svelte.test.ts` — "spaces the required asterisk with a logical
  (RTL-safe) margin": compiles the component's SCSS and asserts `.req` uses
  `margin-inline-start` and that no physical `margin/padding-left/right` remains. Fails
  on the old `margin-left`, passes with the fix.
