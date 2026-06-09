---
id: DS-0033
type: task
title: "Input improvements"
status: done
priority: low
tags: [ui, a11y, forms]
depends_on: []
parent: DS-0020
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `Input` (`src/lib/components/Input.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Slotted hint + error text** — add `hint`/`error` rendered inside `.ss-field` with auto-ids composed into `aria-describedby` (error id first); `error` implies `aria-invalid`
- [ ] **Announce the error to AT** — give the error element `role="alert"`/`aria-live="polite"` so it is read when it appears (WCAG 3.3.1)
- [ ] **Leading / trailing prefix-suffix slots** — add `prefix`/`suffix` Snippets; move the border/focus ring onto a `.control` wrapper so they sit inside the field
- [ ] **Pass through native input attributes** — add `readonly`, `autocomplete`, `inputmode`, `maxlength`, and spread `...rest` so all native attrs/handlers forward
- [ ] **Clearable affordance** — add `clearable?: boolean` → trailing clear `<button aria-label="Clear">` that empties the value and refocuses, hidden when empty/readonly/disabled
- [ ] **Visible required / optional marker** — when `label && required`, show a visible marker (or an `(optional)` toggle) without double-announcing
- [ ] **Style disabled + invalid states** — add `&[aria-invalid=true]` red border/ring and `&:disabled` muted/`not-allowed` rules (token-driven, zero radius)
- [ ] Tests extended in `test/unit/Input.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0020-input-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
