---
id: DS-0059
type: story
title: "Disabled button — no hover glow / brighten"
status: done
priority: low
tags: [ui, button, polish]
depends_on: []
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
A disabled `Button` should read as inert. Previously every variant's hover
affordance (`&:hover`) fired even when the control was disabled — browsers still
match `:hover` on a disabled `<button>` — so a disabled **primary** button lit up
with `--ss-shadow-glow` and brightened under the pointer. This story gates the
hover styles so disabled buttons stay dim and flat.

## Acceptance criteria
- [x] Every hover affordance in `Button.svelte` is gated on `:not(:disabled)`
  (`&:not(:disabled):hover`), so the base brighten, the primary glow/fill, the
  danger fill, and the ghost fill no longer apply while disabled.
- [x] `&:disabled` explicitly resets `box-shadow: none` as a belt-and-suspenders
  guard against any future glow rule.
- [x] No token or public-API change — purely the disabled visual contract.
- [x] `Button.svelte.test.ts` extended with a style-contract block (jsdom can't
  apply scoped CSS / simulate `:hover`, so the guard is asserted at the source:
  no bare `&:hover`, glow gated behind `:not(:disabled):hover`, `:disabled` resets
  `box-shadow`).
- [x] `pnpm test` green; `pnpm pack` clean.

## Notes
- Loading buttons keep their existing treatment (soft-disable: focusable, dimmed
  to `opacity: 0.8`, `cursor: progress`); this story scopes only the native
  `:disabled` state the user flagged.
