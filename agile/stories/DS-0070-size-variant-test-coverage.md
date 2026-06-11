---
id: DS-0070
type: story
title: "Size-variant & config test coverage — sm/md/lg for every component"
status: todo
priority: high
tags: [tests, size-variants, config]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a maintainer I can trust that the size axis works on every component. Today only
SegmentedControl tests `sm`, four components test `lg`, and nothing tests `md`; there is
no test for the size cascade (global default → ancestor attribute → explicit prop) and no
component test exercises `applyDesignConfig`.

## Acceptance criteria
- [ ] Parameterized size tests (sm/md/lg) for: Badge, Button, Card, EmptyState, Input,
  Link, LogStream, MetricTile, ServiceCard, Sidebar, Sparkline, Toaster, Topbar,
  SegmentedControl (md+lg).
- [ ] New `test/unit/cascade.test.ts`: integration test of size inheritance —
  global default → nested component inherits → explicit prop overrides both
  (e.g. Button inside Sidebar with mixed `componentsSize`).
- [ ] Theme-application tests: ~5 key components (Button, Badge, Input, Sidebar, Icon)
  rendered under `applyDesignConfig({ theme: 'light' })` and `dark`.
- [ ] Coverage reporting enabled in `vitest.config.ts` (`coverage: { provider: 'v8' }`),
  baseline thresholds set.
- [ ] `pnpm test` green.

## Notes
- No docs surface — pure test work (Documentation criterion dropped per agile/README.md).
- Scan baseline: 502 tests passing.
