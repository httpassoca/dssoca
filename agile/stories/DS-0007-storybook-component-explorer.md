---
id: DS-0007
type: story
title: "Interactive component explorer (Storybook)"
status: in-progress
priority: high
tags: [tooling, docs, dx]
depends_on: []
parent: null
epic: null
created: 2026-06-06
updated: 2026-06-06
---

## Description
As the design-system maintainer, I can browse and exercise components in isolation in a
Storybook, toggling the two design axes (color `dark`/`light`, density `comfy`/`compact`)
from the toolbar, so I can develop, document, and visually review components without wiring
them into the showcase app. Covers all 14 components.

## Acceptance criteria
- [x] Storybook (v10, `@storybook/sveltekit`) runs against the existing Vite/SvelteKit + Svelte 5 setup
- [x] `pnpm storybook` (dev) and `pnpm build-storybook` (static) scripts exist; static build succeeds
- [x] Stories authored in Svelte CSF (`@storybook/addon-svelte-csf`) + autodocs (`@storybook/addon-docs`)
- [x] Toolbar globals for both axes apply `data-theme`/`data-density` to `<html>` so stories recolor/rescale via the real cascade
- [x] `Button` page with Primary / Secondary / Ghost / Disabled stories and live Controls (variant, type, disabled, label)
- [x] A page for **every** component (14 total): Badge, Button, Card, EmptyState, Icon, Input, LogStream, MetricTile, PassocaMark, ServiceCard, Sidebar, Sparkline, Toaster, Topbar — each with multiple stories covering real variants/states
- [x] Stories live in `src/stories/` (not `src/lib/`) so `svelte-package` never publishes them — verified `pnpm pack` tarball contains no story/Storybook files
- [x] `pnpm test` green (121) and `pnpm pack` clean; full `pnpm build-storybook` succeeds

## Notes
- Config: `.storybook/main.ts` (stories glob `src/**`, framework `@storybook/sveltekit`),
  `.storybook/preview.ts` (imports `theme.css`, axis toolbar globals + decorator).
- Story: `src/stories/Button.stories.svelte` — `Button` takes its label as a child snippet,
  so a shared `template` snippet + `label` arg drives the text via Controls.
- `pnpm-workspace.yaml` `allowBuilds: { esbuild: true }` lets pnpm 11 run esbuild's postinstall
  (Storybook/Vite need the native binary).
- `/storybook-static` gitignored. CI still runs `pnpm test` + `pnpm pack` only; Storybook build
  is not wired into CI yet (follow-up if desired).
- Interactive notes: `Input` value is `$bindable` (typed one-way per story; the binding falls
  back to the child). `Sidebar`/`Topbar` are controlled (parent owns `active`) — each story sets
  its own active item and forwards the callback to the actions panel. `Toaster` reads the
  module-singleton store, so its Playground story fires the `toast` API from trigger buttons.
- Avoid `$state()` inside `{@const}` in story markup — the Svelte CSF static indexer can't parse
  it (SB_SVELTE_CSF_PARSER_EXTRACT_SVELTE_0009); use plain controlled props instead.
