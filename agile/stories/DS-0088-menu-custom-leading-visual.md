---
id: DS-0088
type: story
title: "Menu: custom leading visual per item"
status: done
priority: high
tags: [ui, menu, api]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer, I want **MenuItem to accept arbitrary leading content**, not just
`icon: IconName`. Real menus lead with things the icon registry can't express: theme color
dots (a swatch of the theme being selected) or emoji flags for language pickers. Add a snippet
option (and/or a first-class color-swatch option) for the leading slot. Migrating its
theme/language menus to `Menu`, passoca had to fold emoji flags into the label text and lost
its theme color swatches entirely.

## Acceptance criteria
- [x] MenuItem accepts custom leading content — a Svelte 5 snippet for arbitrary markup and/or
  a `swatch: <color>` convenience that renders a token-sized color dot.
- [x] Leading visual is sized/spaced from `--ss-*` tokens identically to the `icon` case, so
  mixed menus (icon items + swatch items) align; zero border-radius.
- [x] Custom leading content is decorative by default (label carries the semantics) — WCAG
  2.2 AA upheld.
- [x] Additive: `icon: IconName` keeps working unchanged.
- [x] Tests cover snippet and swatch rendering alongside icon items; `pnpm test` green.
- [x] Documentation updated (docs.config.ts Menu page: new prop/snippet + a swatch usage example).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]]; the swatch glyph need also touches
  [[DS-0087-icon-glyph-set]].
- Site workaround removed: passoca folding emoji flags into MenuItem labels and dropping its
  theme color dots.
- Shipped API (2026-06-12): `MenuItem.leading?: Snippet` (arbitrary markup),
  `MenuItem.swatch?: string` (square color chip, `--ss-icon` sized, zero radius),
  `MenuItem.emoji?: string` (text glyph). Precedence: leading → swatch → emoji → icon.
  All leading visuals render aria-hidden; the `label` names the row.
