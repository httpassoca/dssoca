---
id: DS-0165
type: task
title: "Button: Front-End Checklist fixes"
status: done
priority: low
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Front-End Checklist audit (GitHub issue #139) findings for `Button`.

### Low · `button-name` — `<Button iconOnly>` without `label` has no name

Confirmed: with `iconOnly` and no `label`, `aria-label` resolved to `undefined` and the
children are just a glyph, so the rendered button had no accessible name.

Fixed with a runtime warning rather than a discriminated-union prop type: a union would make
`iconOnly={someBoolean}` fail to type-check (the Storybook story and test harness both do
this), which is a breaking change for consumers. `Button.svelte` now logs
`[dssoca] Button: \`iconOnly\` needs a \`label\` ...` via `console.warn` (same pattern as
`Icon`) when `iconOnly` is set and none of `label`, a forwarded `aria-label` or
`aria-labelledby` is non-empty. Prop JSDoc and the docs page (`iconOnly` prop) describe it.

No cross-cutting finding names Button. Button has no vanilla behaviour, and the DOM/classes are
unchanged.

### Tests

`test/unit/Button.svelte.test.ts` (icon-only block):

- warns when `iconOnly` has no label (fails without the fix);
- does not warn when named via `label`, `aria-label` or `aria-labelledby`;
- does not warn for a plain button without a label.
