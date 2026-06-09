---
id: DS-0041
type: task
title: "Toaster improvements"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: DS-0028
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `Toaster` (`src/lib/components/Toaster.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Pause auto-dismiss on hover/focus** — move timing into a per-toast controller (remaining/startedAt) with pause()/resume() on pointerenter/leave + focusin/out
- [ ] **Action button** — extend `Toast`/`push` with `action?: {label, onClick}`; invoking dismisses unless the callback returns `false` (action toasts default to longer/sticky)
- [ ] **Per-toast duration incl. sticky** — treat `timeout <= 0`/`Infinity` as sticky (documented), with a longer default for `error`
- [ ] **Cap the stack with a queue** — add `max` (default ~3) + a private queue; render `max`, promote from the queue on dismiss
- [ ] **Configurable position** — add a `position?` prop (six positions) as `data-position` reading `--ss-s-*`; reverse flex for bottom positions
- [ ] **Promise / update-by-id** — add `update(id, patch)` + `toast.promise(p, {loading,success,error})` and a `loading` kind (reduced-motion-guarded spinner)
- [ ] **Swipe + keyboard dismissal** — pointer-drag swipe-to-dismiss (threshold, motion-guarded) + an `Escape` handler on the focused toast
- [ ] Tests extended in `test/unit/Toaster.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0028-toaster-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
