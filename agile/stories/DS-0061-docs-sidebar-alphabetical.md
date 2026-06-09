---
id: DS-0061
type: story
title: "Docs sidebar — components listed alphabetically"
status: done
priority: low
tags: [docs, nav]
depends_on: []
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
The docs left-nav listed components in `COMPONENTS` source/insertion order (Icon,
Badge, Button, …, then the DS-0043 batch). That's not scannable. Sort the
**components** nav section alphabetically by name.

## Acceptance criteria
- [x] The `components` group in `NAV` (`docs.config.ts`) sorts a copy of
  `COMPONENTS` by `name.localeCompare` before mapping to links. `COMPONENTS`
  itself keeps source order (drives the per-component `entries()` prerender +
  homepage grid, unchanged).
- [x] Result: Accordion, Badge, BottomNav, Button, Card, EmptyState, Icon, Image,
  Input, Link, LogStream, Menu, MetricTile, SegmentedControl, ServiceCard,
  Sidebar, Sparkline, Toaster, Topbar.
- [x] `docs.config.test.ts` extended: the components nav equals its sorted copy
  and starts with `Accordion`.
- [x] `pnpm docs:test` green.

## Notes
- Only the sidebar order changes; slugs/hrefs and the per-component pages are
  untouched. Isolated to the `components` nav group, so it composes cleanly with
  the components-overview page nav entry ([[DS-0062-docs-components-overview]]).
