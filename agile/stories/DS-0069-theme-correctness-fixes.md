---
id: DS-0069
type: story
title: "Theme correctness — light-theme gaps, hardcoded colors, color-scheme"
status: todo
priority: high
tags: [theming, tokens, scss]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a user on the light theme, every surface flips correctly. The scan found color values
that don't participate in theming.

## Acceptance criteria
- [ ] `BottomNav.svelte` (~L198): hardcoded `#001b04` replaced with the on-primary token
  (e.g. `var(--ss-fg-on-primary)` or existing equivalent).
- [ ] `_base.scss` (~L111): `code`/`kbd` background `rgba(255,255,255,0.06)` becomes a
  per-theme token (e.g. `--ss-code-overlay`) with a dark overlay in light theme.
- [ ] Selection tokens (`--ss-selection-bg/fg`) get explicit `[data-theme="light"]` overrides.
- [ ] `color-scheme` set on `:root` (and flipped per `data-theme`) so native form controls
  and scrollbars match the theme.
- [ ] Quick contrast audit of main text/bg and muted/bg pairs in both themes against
  WCAG 2.2 AA; adjust tokens that fail.
- [ ] Tests cover the changed tokens where feasible; `pnpm test` green.
- [ ] Documentation updated (`docs/themes.md` + `docs/tokens.md`).

## Notes
- Stretch (optional, can split out): `@media (prefers-contrast: more)` / forced-colors hooks.
