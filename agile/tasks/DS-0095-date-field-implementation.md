---
id: DS-0095
type: task
title: "DateField implementation"
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
Build the `DateField` component at `src/lib/components/DateField.svelte` for the geossoca consumer.
A styled native `<input type=\"date\">` reusing Input's field chrome with min / max support. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes), `size` prop via
`resolveComponentSize('DateField', size)`, WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('DateField', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/DateField.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/DateField.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/date-field.ts`, registered in the docs index.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Used for the game date in game entry.
