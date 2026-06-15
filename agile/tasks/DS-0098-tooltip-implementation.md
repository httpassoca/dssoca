---
id: DS-0098
type: task
title: "Tooltip implementation"
status: done
priority: low
tags: [ui, a11y, overlay]
depends_on: []
parent: null
epic: DS-0090
created: 2026-06-15
updated: 2026-06-15
---

## Description
Build the `Tooltip` component at `src/lib/components/Tooltip.svelte` for the geossoca consumer.
A hover / focus tooltip with `role=tooltip`, aria-describedby wiring, and reduced-motion support. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes), `size` prop via
`resolveComponentSize('Tooltip', size)`, WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('Tooltip', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/Tooltip.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/Tooltip.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/tooltip.ts`, registered in the docs index.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Used for affordance hints across the app.
