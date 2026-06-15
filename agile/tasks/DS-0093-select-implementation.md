---
id: DS-0093
type: task
title: "Select implementation"
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
Build the `Select` component at `src/lib/components/Select.svelte` for the geossoca consumer.
A styled native `<select>` reusing Input's `.ss-field` chrome (label / hint / error / aria-describedby), accepting flat options or option groups. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes), `size` prop via
`resolveComponentSize('Select', size)`, WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('Select', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/Select.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/Select.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/select.ts`, registered in the docs index.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Used for player pickers in game entry.
