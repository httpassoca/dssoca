---
id: DS-0097
type: task
title: "NumberField implementation"
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
Build the `NumberField` component at `src/lib/components/NumberField.svelte` for the geossoca consumer.
A numeric input with stepper buttons, min / max / step, clamping, and a monospace value. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes), `size` prop via
`resolveComponentSize('NumberField', size)`, WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('NumberField', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/NumberField.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/NumberField.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/number-field.ts`, registered in the docs index.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Used for per-player scores in game entry.
