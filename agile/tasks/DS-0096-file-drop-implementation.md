---
id: DS-0096
type: task
title: "FileDrop implementation"
status: done
priority: low
tags: [ui, a11y, forms]
depends_on: []
parent: null
epic: DS-0090
created: 2026-06-15
updated: 2026-06-15
---

## Description
Build the `FileDrop` component at `src/lib/components/FileDrop.svelte` for the geossoca consumer.
A drag-and-drop file picker with click-to-browse, accept filtering, and selected-file display. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes), `size` prop via
`resolveComponentSize('FileDrop', size)`, WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('FileDrop', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/FileDrop.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/FileDrop.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/file-drop.ts`, registered in the docs index.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Used for JSON import of saved data.
