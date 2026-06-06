---
id: DS-0002
type: story
title: "Reusable Svelte 5 component set (~14 components)"
status: done
priority: high
tags: [ui]
depends_on: [DS-0001]
parent: null
epic: null
created: 2026-06-05
updated: 2026-06-06
---

## Description
As an app author, I import ready-made Svelte 5 components from `dssoca` instead
of rebuilding primitives per project, so every app looks consistent and picks
up the active theme/density automatically.

## Acceptance criteria
- [x] ~14 components shipped: Badge, Button, Card, EmptyState, Icon, Input, LogStream, MetricTile, PassocaMark, ServiceCard, Sidebar, Sparkline, Toaster, Topbar
- [x] All exported from the package root (`import { Button, Card } from 'dssoca'`)
- [x] Components are unstyled wrappers over global `.hub-*` classes in `theme.css` — they inherit whatever theme/density is active on an ancestor
- [x] Icon set includes a `book` glyph
- [x] Built to `dist` via `svelte-package` for consumers
- [x] Vitest + @testing-library/svelte suite covers the components

## Notes
- `src/lib/components/` — one `.svelte` file per component
- `src/lib/index.ts` — package barrel export
- Runner: `pnpm test` (Vitest, jsdom) — per the testing rule, extend on any change
