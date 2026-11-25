---
id: DS-0200
type: story
title: "Tabs, Popover, Checkbox and RadioGroup — built core-first"
status: in-progress
priority: high
tags: [ui, components, a11y, vanilla]
depends_on: [DS-0199]
parent: null
epic: DS-0197
created: 2026-11-24
updated: 2026-11-24
---

## Description

As an app author I want tabs, a popover, a checkbox and a radio group in the design system, so
I stop hand-rolling them. Each is built on the behaviour core from day one, with a plain-HTML
twin: `core/tabs.ts`, `core/popover.ts` (+ `core/behaviors/focusable.ts`), `core/checkbox.ts`,
`core/radio.ts`.

- **Tabs**: `tabs` array + `panel` snippet, `activation` auto/manual, `onChange(id, { reason })`.
- **Popover**: `trigger` snippet + children, `side`/`align`, `onOpenChange(open, { reason })`.
- **Checkbox**: native input, bindable `checked` + `indeterminate`. No `reason` (the browser
  reports every activation as one `change`).
- **RadioGroup**: native radios, `options` + bindable `value`. No `reason`, same cause.

## Acceptance criteria

- [x] Each has a core, a component, a vanilla twin, tests (core, component, vanilla), a docs
      page with `htmlExample`, and a story.
- [x] `pnpm test`, `pnpm docs:test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green.
- [x] Browser pass in headless Chromium, both themes and `dir="rtl"` (Storybook).
- [x] Documentation updated (component pages, docs/tokens.md, CHANGELOG).
- [ ] Owner looked at the four components and their API.

## Notes

- Popover does not flip at the viewport edge (same as Menu).
- Not checked: Firefox/Safari, a real screen reader, measured contrast, the built docs site.
