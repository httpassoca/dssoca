---
id: DS-0040
type: task
title: "LogStream improvements"
status: in-progress
priority: high
tags: [ui, a11y]
depends_on: []
parent: DS-0027
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
Implement the researched improvements for `LogStream` (`src/lib/components/LogStream.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Accept real lines; make mock opt-in** — promote `lines` to a controlled prop, type the level (`LogLevel`), gate the generator behind `demo?`, replace the hardcoded 30 with `maxLines?`
- [ ] **`role="log"` live-region semantics** — add `role="log"` + `aria-label` and an `announce?: off|polite|assertive` prop mapping to `aria-live`
- [ ] **Follow-tail with pause-on-scroll-up** — track `following`; auto-scroll only when near bottom, re-arm on scroll-back, with a "Jump to bottom" affordance
- [ ] **Controls toolbar** — optional header: per-level filter, text filter, wrap toggle, copy-to-clipboard, clear (toggles use `aria-pressed`)
- [ ] **Line-wrapping toggle** — add `wrap?: boolean`; off → `white-space: pre` + horizontal scroll, on → `pre-wrap`, preserving whitespace alignment
- [ ] **Empty + loading states** — render `EmptyState`/`empty?` Snippet when no lines and a `loading?` connecting indicator
- [ ] **Use tokens + scale with size** — replace `#0a0a0a` with `--ss-code-bg`, prefer `--ss-code-*` level colours, derive gap/font from size tokens so `data-size-variant` works
- [ ] Tests extended in `test/unit/LogStream.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0027-log-stream-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
