---
id: DS-0124
type: story
title: "Add --ss-gap-xs token; tighten FileDrop files list to it"
status: done
priority: low
tags: [filedrop, tokens, spacing]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a user with several selected files, I want the FileDrop selected-files list to sit tighter, so the list reads as one compact group rather than a loose stack. The list `<ul class="files">` in `src/lib/components/FileDrop.svelte` currently uses `gap: var(--ss-gap-sm, 4px)`. We want it on a smaller step, `var(--ss-gap-xs)` — but **that token does not exist yet**. So this story first introduces a new `--ss-gap-xs` spacing token across all three `data-size-variant` blocks in `src/styles/_tokens.scss` (the gap family today is only `--ss-gap` = 14/8/18 md/sm/lg and `--ss-gap-sm` = 10/6/13 md/sm/lg), documents it in `docs/tokens.md`, then switches the FileDrop files list to it.

## Acceptance criteria
- [x] New `--ss-gap-xs` token defined in `src/styles/_tokens.scss` for **all three** size blocks (`[data-size-variant='md']` / `'sm'` / `'lg']`, plus the `:root,[data-size-variant='md']` default), each smaller than the matching `--ss-gap-sm` (10/6/13). Proposed values to finalise in implementation: **md 6px / sm 4px / lg 8px** (kept on the 2px grid, monotonic with the existing `--ss-gap-sm`/`--ss-gap` steps).
- [x] `--ss-gap-xs` documented in `docs/tokens.md` alongside `--ss-gap` / `--ss-gap-sm` (all three size values listed), matching the table format used for the other gap tokens.
- [x] `src/lib/components/FileDrop.svelte` `<ul class="files">` rule uses `gap: var(--ss-gap-xs)` (replacing `var(--ss-gap-sm, 4px)`).
- [x] Scope decision recorded: only the **list** (`ul.files`) outer gap changes to `--ss-gap-xs`; the per-file inner row gap (`.file { gap: var(--ss-gap-sm, 4px) }`) **stays on `--ss-gap-sm`** — the inner row separates name/size/remove and reads better with the slightly larger step; revisit only if visual harmony dictates.
- [x] Visual check confirms a tighter selected-files list at sm/md/lg in both themes, with no regression to the `.zone`, `.prompt`, or `.clear` spacing.
- [x] Zero border-radius preserved; tokens stay CSS custom properties (not Sass `$variables`) so the size-axis cascade resolves at runtime; `--ss-*` naming.
- [x] Tests added/updated; `pnpm test` green (vitest-axe where UI changes).
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed).

## Notes
- Refinement research: mature spacing scales explicitly include a 2px/4px floor below the "small" step, which is exactly the `gap-xs` rung this story adds. Carbon's spacing scale runs `$spacing-01: 2px; $spacing-02: 4px; $spacing-03: 8px; $spacing-04: 12px; …` — built on multiples of 2/4/8, with 2px and 4px as the tightest in-component steps for dense lists. This dssoca gap family is a semantic (gap-purpose) scale rather than a raw numeric one, so the new rung is named `--ss-gap-xs` (mirroring `--ss-gap` / `--ss-gap-sm`) and the proposed md 6px / sm 4px / lg 8px values stay on the 2px grid and below the current `--ss-gap-sm` of 10/6/13 — i.e. a genuine extra-small step for tight intra-component lists, matching Carbon's `spacing-01/02` intent. (Polaris similarly exposes an `space-100`/`space-050` end of its `--p-space-*` scale for the same tight-grouping purpose.) Sources: https://carbondesignsystem.com/elements/spacing/overview/ , https://carbondesignsystem.com/elements/2x-grid/overview/
- Ordering matters: the token must land (and be documented) **before** FileDrop references it, or the `ul.files` gap would resolve to nothing (no fallback proposed — the token will exist). Low priority / additive token; the only consuming change is the one FileDrop list rule, though the new token is reusable system-wide.
