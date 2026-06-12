---
id: DS-0070
type: story
title: "Size-variant & config test coverage — sm/md/lg for every component"
status: done
priority: high
tags: [tests, size-variants, config]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a maintainer I can trust that the size axis works on every component. Today only
SegmentedControl tests `sm`, four components test `lg`, and nothing tests `md`; there is
no test for the size cascade (global default → ancestor attribute → explicit prop) and no
component test exercises `applyDesignConfig`.

## Acceptance criteria
- [x] Parameterized size tests (sm/md/lg) for: Badge, Button, Card, EmptyState, Input,
  Link, LogStream, MetricTile, ServiceCard, Sidebar, Sparkline, Toaster, Topbar,
  SegmentedControl (md+lg). → `test/unit/sizes.svelte.test.ts` (table-driven; also
  covers the 0.9.0 additions Heading, Container, Textarea, Spinner, plus a
  "no size → no attribute, inherit the cascade" case per component).
- [x] New `test/unit/cascade.svelte.test.ts`: integration test of size inheritance —
  global default → nested component inherits → explicit prop overrides both
  (Button + Badge nested under an ancestor `data-size-variant` via
  `test/harness/CascadeHarness.svelte`, with mixed `componentsSize`; config
  singleton reset between tests).
- [x] Theme-application tests: 5 key components (Button, Badge, Input, Sidebar, Icon)
  rendered under `applyDesignConfig({ theme: 'light' })` and `dark` →
  `test/unit/theme-application.svelte.test.ts` (jsdom can't compute CSS-var colors;
  tests pin the attribute mechanism + getDesignConfig round-trip).
- [x] Coverage reporting enabled in `vitest.config.ts` (`coverage: { provider: 'v8' }`),
  baseline thresholds set ~5 points under measured actuals (lines 94.09 / statements
  93.34 / functions 95.09 / branches 81.49 over `src/lib/**` → floors 89/88/90/76).
- [x] `pnpm test` green (all new files pass; coverage is opt-in via `--coverage`, the
  `test` script is untouched).

## Notes
- No docs surface — pure test work (Documentation criterion dropped per agile/README.md).
- Scan baseline: 502 tests passing.
- Coverage requires `@vitest/coverage-v8` (^4.1.7) as a devDependency — **not yet in
  package.json** (file owned by a parallel agent during this release). Actuals were
  measured in an isolated copy; plain `vitest run` does not load the provider, so
  nothing breaks until it is installed. Add the dep to enable `--coverage` locally/CI.
