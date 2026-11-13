---
id: DS-0191
type: task
title: "MetricTile: Front-End Checklist fixes"
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

Front-End Checklist findings for `MetricTile` (issue #139).

### Medium · `aria-live-regions`: every tile's bare value is a live region — fixed

Confirmed: `.val` was always `role="status" aria-live="polite"`, so each tile announced a bare
number ("42") with no label, and a dashboard of tiles had many competing regions.

- New `live?: boolean` prop, default `false`. Liveness is now opt-in.
- When `live`, the tile root (always mounted, so the region exists before its content changes)
  is `role="status" aria-live="polite" aria-atomic="true"`. An update is read as
  "label value delta". The existing `aria-busy` while `loading` holds the announcement until
  the value arrives.
- `.val` no longer carries `role`/`aria-live`.
- **Behaviour change:** tiles are no longer announced by default. Pass `live` to keep updates
  announced. Documented in the docs page notes and flagged for the changelog.

Tests (`test/unit/MetricTile.svelte.test.ts`): no live region by default; root is a polite
atomic status region containing the label when `live`, and there is exactly one region; the
region element stays mounted across the `loading` → loaded transition.

Docs: `live` prop + notes in `documentation/src/lib/component-docs/metric-tile.ts`; a `live`
control and a "Live" story in `src/stories/MetricTile.stories.svelte`.
