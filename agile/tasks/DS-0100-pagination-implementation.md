---
id: DS-0100
type: task
title: "Pagination implementation"
status: done
priority: low
tags: [ui, a11y, navigation]
depends_on: []
parent: null
epic: DS-0090
created: 2026-06-15
updated: 2026-06-15
---

## Description
Build the `Pagination` component at `src/lib/components/Pagination.svelte` for the geossoca consumer.
Windowed page controls with prev / next, ellipses, and `aria-current=page`. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes), `size` prop via
`resolveComponentSize('Pagination', size)`, WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('Pagination', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/Pagination.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/Pagination.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/pagination.ts`, registered in the docs index.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Used to page long game / ranking lists.
