---
id: DS-0121
type: story
title: "Remove Badge vertical padding (height from line-height)"
status: done
priority: low
tags: [badge, layout]
depends_on: [DS-0111]
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a `dssoca` consumer, I want `Badge`'s height to be driven by its content and line-height rather than an explicit vertical padding, so badges sit compactly and align cleanly inline with adjacent text at every size. Today the badge pads `var(--ss-badge-py) var(--ss-badge-px)` where `--ss-badge-py` is `5px` (md) / `3px` (sm) / `7px` (lg); that vertical padding inflates badge height independently of the surrounding text and is easy to mis-tune across sizes.

Set the vertical padding to `0` (drop `--ss-badge-py` from the padding shorthand, keeping the horizontal `--ss-badge-px`). The dot, count, and label must stay vertically centred via the existing flex alignment, and the badge must still align nicely on the text baseline/centre when placed inline with running text.

This change is scoped to be consistent with the coordinated inner-sizing work in [[DS-0111]] (so the line-height-derived sizing matches how the other inner elements are coordinated), hence `depends_on: [DS-0111]`.

## Acceptance criteria
- [x] No vertical padding is applied to `.ss-badge`: the `padding` shorthand uses `0 var(--ss-badge-px)` (or equivalent), and the `--ss-badge-py` token is removed (all sm/md/lg blocks) since it no longer feeds the badge.
- [x] Badge height is determined by content + line-height; an explicit, sensible `line-height` is set so height is predictable and stable across sm/md/lg.
- [x] Dot, count, and label remain vertically centred (flex `align-items: center` retained); verified visually at sm, md, and lg.
- [x] A badge placed inline with running text aligns cleanly (no vertical jump / misalignment) at all three sizes.
- [x] Horizontal padding (`--ss-badge-px`) and `--ss-badge-gap` / `--ss-badge-dot` behaviour are unchanged.
- [x] `pnpm test` green; Badge unit test covers the alignment-relevant structure and `vitest-axe` stays clean.
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed) — reflect the removed `--ss-badge-py` token in `docs/tokens.md`.

## Notes
- Part of epic [[DS-0107]] (Badge refinement). Depends on [[DS-0111]] (coordinated inner sizes) so line-height-driven height is consistent with the wider inner-sizing approach.
- Source: `src/lib/components/Badge.svelte` — `padding: var(--ss-badge-py) var(--ss-badge-px)` (line 90); `--ss-badge-py` token in `src/styles/_tokens.scss` (`5px` md line ~296, `3px` sm line ~359, `7px` lg line ~422).
- **Research — compact inline badges size from line-height, not vertical padding:**
  - **GitHub Primer Label** is a compact inline `<span>` whose height tracks its text/line-height; it favours horizontal padding + line-height over heavy vertical padding so labels sit inline with text. (https://primer.style/components/label/)
  - **IBM Carbon Tag** defines fixed small/compact tag heights driven by type scale + line-height rather than ad-hoc vertical padding, keeping inline tags tight against running text. (https://carbondesignsystem.com/components/tag/style/)
  - Removing `--ss-badge-py` and letting line-height own the vertical metric makes inline alignment deterministic and removes a per-size token to keep tuned.
- This is non-breaking for the public component API (no prop change); it removes an internal token (`--ss-badge-py`), which is a documented token-surface change.
- Sequence after / alongside [[DS-0119]] and [[DS-0120]] when batching Badge work; only this one carries a hard dependency (DS-0111).
