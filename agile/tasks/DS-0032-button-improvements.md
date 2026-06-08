---
id: DS-0032
type: task
title: "Button improvements"
status: todo
priority: low
tags: [ui]
depends_on: []
parent: DS-0019
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
Implement the researched improvements for `Button` (`src/lib/components/Button.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **`loading` state** — add `loading?: boolean` → `aria-busy`, guarded click, an em-sized spinner, stable accessible name (or `loadingLabel`)
- [ ] **Soft-disable via `aria-disabled`** — when loading/soft-disabled, prefer `aria-disabled` + guarded handler so the control stays focusable and announceable
- [ ] **`danger` / destructive variant** — extend the variant union with `danger`, styled from `--ss-danger*` tokens mirroring the `.primary` block
- [ ] **Icon-only button with required label** — add `iconOnly?: boolean` + required `label` → `aria-label`, square padding from `--ss-control-py`
- [ ] **Leading / trailing icon snippets** — add `leading?`/`trailing?` Snippets around `children`; replace the hardcoded `gap: 6px` with a size token
- [ ] **`fullWidth` (block) prop** — add `fullWidth?: boolean` → `width: 100%; justify-content: center` (layout only)
- [ ] **Forward rest props + element ref** — spread `...rest: HTMLButtonAttributes` onto `<button>` and add `el = $bindable<HTMLButtonElement>()` for focus management
- [ ] Tests extended in `test/unit/Button.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0019-button-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
