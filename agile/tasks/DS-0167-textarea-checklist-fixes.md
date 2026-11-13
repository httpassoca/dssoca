---
id: DS-0167
type: task
title: "Textarea: Front-End Checklist fixes"
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

Front-End Checklist audit (issue #139) listed Textarea as clean apart from the shared
cross-cutting RTL finding.

- **Low · `logical-properties`: `.req { margin-left }`** (`Textarea.svelte:143`) — confirmed.
  Fixed: the required-marker gap is now `margin-inline-start: 2px`, so it follows the
  writing direction in RTL.
  Test: `Textarea.svelte.test.ts` › "spaces the required marker with a logical property, not
  margin-left" compiles the component's SCSS and asserts `.req` uses `margin-inline-start`
  and no physical `left`/`right` remains.

No other finding names Textarea (no focus-ring override, no touch-target, live-region or
keyboard items). Docs note updated in `documentation/src/lib/component-docs/textarea.ts`.
