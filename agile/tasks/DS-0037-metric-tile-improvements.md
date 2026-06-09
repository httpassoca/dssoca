---
id: DS-0037
type: task
title: "MetricTile improvements"
status: done
priority: low
tags: [ui, a11y, dataviz]
depends_on: []
parent: DS-0024
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `MetricTile` (`src/lib/components/MetricTile.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Decouple delta direction from good/bad colour** — add `trend?: positive|negative|neutral` (or `invert?`) driving colour independently of the arrow; default preserves up=positive
- [ ] **Accessible delta description** — wrap the arrow in `aria-hidden`; give `.delta` a worded label ("increased 12% …") so colour/arrow isn't the only signal
- [ ] **Comparison-period label** — add `deltaLabel?` ("vs prev 7d") shown faint and woven into the accessible description
- [ ] **Loading / skeleton state** — add `loading?: boolean` → `aria-busy` + skeleton bars; announce the real value via `role="status"` on arrival
- [ ] **Trend / sparkline snippet slot** — add a `trend?: Snippet` below the delta so callers can drop in `<Sparkline>` (mirror Badge's Snippet import)
- [ ] **Value formatting / unit prefix** — add `prefix?` (for `$`/`€`) styled like `.small`; keep `tabular-nums` for grouped numbers
- [ ] **Optional soft sentiment emphasis** — opt-in `emphasis?` rendering the delta as a `--ss-primary-soft`/red-soft chip for non-colour redundancy
- [ ] Tests extended in `test/unit/MetricTile.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0024-metric-tile-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
