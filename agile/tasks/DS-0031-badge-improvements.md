---
id: DS-0031
type: task
title: "Badge improvements"
status: in-progress
priority: high
tags: [ui, a11y]
depends_on: []
parent: DS-0018
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
Implement the researched improvements for `Badge` (`src/lib/components/Badge.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Decouple the dot from tone** — replace the always-true `hasDot` with a real `dot?: boolean` prop; dot stays `aria-hidden`
- [ ] **Add a neutral / default tone** — extend the union with `neutral` (using `--ss-line`/`--ss-fg-muted`) as the safe baseline for non-status labels
- [ ] **Dot-only (label-less) status mode** — make `children` optional; when omitted render the dot + an `aria-label` carrying the status text (avoids a colour-only WCAG 1.4.1 fail)
- [ ] **Dismissible tag variant** — add optional `ondismiss` → trailing `<button aria-label="Remove …">`, reusing the Toaster dismiss pattern
- [ ] **Expose status semantics to AT** — opt-in `role="status"`/`aria-live="polite"` for live-changing status; keep static category tags as plain spans
- [ ] **Count / numeric badge** — add `count?: number` + `max?: number` (default 99) with `99+` overflow, hidden at `count === 0`, bypassing the lowercase transform
- [ ] **Tokenize dot size/gap + theme-correct tones** — replace the hardcoded `5px` dot / `6px` gap with size tokens and fold the raw `rgba()` tone literals onto theme tokens so light mode is correct
- [ ] Tests extended in `test/unit/Badge.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0018-badge-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
