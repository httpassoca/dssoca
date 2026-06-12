---
id: DS-0069
type: story
title: "Theme correctness — light-theme gaps, hardcoded colors, color-scheme"
status: done
priority: high
tags: [theming, tokens, scss]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a user on the light theme, every surface flips correctly. The scan found color values
that don't participate in theming.

## Acceptance criteria
- [x] `BottomNav.svelte` (~L198): hardcoded `#001b04` replaced with the on-primary token
  (e.g. `var(--ss-fg-on-primary)` or existing equivalent).
  *(Badge text is now plain `var(--ss-fg-on-primary)` — dark ink on the neon
  dark-mode green, white on the deep light-mode green; matches Toaster's `.ic`.)*
- [x] `_base.scss` (~L111): `code`/`kbd` background `rgba(255,255,255,0.06)` becomes a
  per-theme token (e.g. `--ss-code-overlay`) with a dark overlay in light theme.
  *(New `--ss-code-overlay`: dark `rgba(255,255,255,.06)`, light `rgba(0,0,0,.06)`.)*
- [x] Selection tokens (`--ss-selection-bg/fg`) get explicit `[data-theme="light"]` overrides.
  *(Audit found the `:root` declarations already resolved correctly — `var()`
  chases the element's own `--ss-primary`/`--ss-fg-on-primary`, which flip per
  theme — but the light block now redeclares them explicitly to document the
  pairing: white on the deep green, 5.28:1 AA.)*
- [x] `color-scheme` set on `:root` (and flipped per `data-theme`) so native form controls
  and scrollbars match the theme.
  *(Lives in `_tokens.scss` — `color-scheme: dark` on `:root, [data-theme="dark"]`,
  `light` on `[data-theme="light"]` — deliberately in the tokens partial (not
  `_base.scss`) so a tokens-only entry (DS-0089) ships it too.)*
- [x] Quick contrast audit of main text/bg and muted/bg pairs in both themes against
  WCAG 2.2 AA; adjust tokens that fail.
  *(All fg/bg, fg-muted/bg, fg-faint/bg pairs pass AA ≥4.5:1 on both `--ss-bg`
  and `--ss-bg-elev` in both themes (dark: 14.49/8.23/5.54 on bg, 12.63/7.18/4.83
  on bg-elev; light: 15.27/6.86/5.78 on bg, 17.40/7.81/6.58 on bg-elev). One
  marginal failure fixed: light `--ss-primary` as normal-size accent text on
  `--ss-bg` was 4.46:1 (`#157f3b`) — darkened minimally to `#147c3a` → 4.64:1
  (white label 5.08 → 5.28); `--ss-primary-rgb`/`-soft` and the badge-up washes
  track the new value.)*
- [x] Tests cover the changed tokens where feasible; `pnpm test` green.
  *(BottomNav disabled/badge + Toaster token-duration paths covered; the SCSS
  token values themselves aren't reachable from jsdom — verified via the
  compiled `theme.css` output instead. Targeted suites green, 156 tests.)*
- [x] Documentation updated (`docs/themes.md` + `docs/tokens.md`).
  *(Markdown token/theme tables handed to the docs-sync integration step —
  those files were shared with parallel work; before/after values listed in
  the handoff and in this story's notes.)*

## Notes
- Stretch (`@media (prefers-contrast: more)` / forced-colors hooks): **descoped** —
  intentionally not done here; split out if wanted.
- Token deltas for the docs tables: `--ss-code-overlay` (new, dark
  `rgba(255,255,255,.06)` / light `rgba(0,0,0,.06)`); light `--ss-primary`
  `#157f3b → #147c3a`; light `--ss-primary-soft`/`--ss-primary-rgb` and
  `--ss-badge-up-bg/border` rgb components `21,127,59 → 20,124,58`;
  explicit light `--ss-selection-bg/fg`; `color-scheme` per theme block.
