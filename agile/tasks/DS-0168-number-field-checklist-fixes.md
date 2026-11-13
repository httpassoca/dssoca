---
id: DS-0168
type: task
title: "NumberField: Front-End Checklist fixes"
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

Fixes the NumberField findings from the Front-End Checklist audit (GitHub issue #139).

### Medium · focus-management: steppers drop focus at the bounds, changes not announced

Confirmed: `decDisabled`/`incDisabled` set native `disabled` at `min`/`max`, so a focused
stepper lost focus to `<body>`, and nudged values were never announced.

- At a bound a stepper now stays focusable with `aria-disabled="true"`; `nudge()` is a no-op
  there. Native `disabled` is kept only when the whole field is `disabled`/`readonly`.
- Steppers carry `aria-controls={inputId}`.
- A visually hidden `<span class="live" aria-live="polite" aria-atomic="true">` is always
  rendered; each stepper nudge writes the new value to it (typing does not, as the input is
  already voiced).
- Vanilla parity in `src/lib/vanilla/fields.ts`: `syncSteppers` sets `aria-disabled` at the
  bounds (native `disabled` only when locked), `nudgeNumber` ignores `aria-disabled` steppers
  and writes the value into the field's `.live` region.

### Medium · focus-styles: steppers use the faint `--ss-primary-soft` ring

Confirmed. `:focus-visible` now draws `outline: 2px solid var(--ss-primary); outline-offset: -2px`
(inset, because the stepper sits flush inside the bordered `.control`). Disabled styling also
covers `[aria-disabled='true']`.

### Low · logical-properties (cross-cutting): `.req { margin-left }`

Confirmed. Now `margin-inline-start: 2px`.

### Tests

- `test/unit/NumberField.svelte.test.ts`: aria-disabled (not native) at min and at max; focus
  stays on a stepper that reaches its bound and the next press is a no-op; `aria-controls`;
  live region present from first render and updated by steppers; typing does not announce;
  readonly natively disables the steppers.
- `test/unit/vanilla-number-field.test.ts` (new): vanilla aria-disabled at bounds with focus
  kept, native disabled when the input is disabled, live region written on nudge.
