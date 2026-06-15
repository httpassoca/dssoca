---
id: DS-0107
type: task
title: "ColorPicker implementation"
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
Build the `ColorPicker` component at `src/lib/components/ColorPicker.svelte` for the geossoca consumer.
A form control for choosing a colour: a row of preset swatch buttons, a native `<input type="color">`,
and a monospace hex text input, all kept in sync with a bindable `value`. Typed hex is normalised
(leading `#` optional, case-insensitive); invalid hex is ignored. Token-driven (zero radius, `--ss-*`
tokens, scoped SCSS, Svelte 5 runes), `size` prop via `resolveComponentSize('ColorPicker', size)`,
WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('ColorPicker', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/ColorPicker.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/ColorPicker.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/color-picker.ts`, registered in the docs index, categories, and hub-data.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Swatch buttons expose `aria-pressed`; preset palette defaults to the on-brand token colours as hex.
