---
id: DS-0094
type: task
title: "Modal implementation"
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
Build the `Modal` component at `src/lib/components/Modal.svelte` for the geossoca consumer.
A native `<dialog>`-based modal with focus trap, Esc / backdrop close, title and footer snippets, and a danger styling hint. Token-driven (zero radius, `--ss-*` tokens, scoped SCSS, Svelte 5 runes), `size` prop via
`resolveComponentSize('Modal', size)`, WCAG 2.2 AA.

## Acceptance criteria
- [x] Component implemented with a scoped `<style lang="scss">` using `--ss-*` tokens, zero radius.
- [x] `size?: Size` resolved via `resolveComponentSize('Modal', size)`; exported from `src/lib/index.ts`; name added to `COMPONENT_NAMES`.
- [x] Storybook story at `src/stories/Modal.stories.svelte`.
- [x] Vitest + vitest-axe test at `test/unit/Modal.svelte.test.ts`; `pnpm test` green, `pnpm check` clean.
- [x] Docs page at `documentation/src/lib/component-docs/modal.ts`, registered in the docs index.

## Notes
- Epic: [[DS-0090-geossoca-component-gaps]]. Consumer: the geossoca score-tracker app.
- Used for edit / delete-confirm and import dialogs.
