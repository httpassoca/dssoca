---
id: DS-0087
type: story
title: "Icon: extend built-in glyph set"
status: done
priority: high
tags: [ui, icon, components]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer, I want the built-in **Icon glyph set extended with common nav/social
glyphs**: home, briefcase, folder, github, linkedin, language/globe, and color-swatch. These
are table-stakes for any site shell, yet none ship today — passoca had to `registerIcon`
hand-drawn paths just to fill its `BottomNav`, and still keeps custom SVG components for the
social links. Shipping them removes per-consumer path drawing and keeps glyph style consistent
with the existing set.

## Acceptance criteria
- [x] New glyphs added to the built-in set: `home`, `briefcase`, `folder`, `github`,
  `linkedin`, `language` (globe), `color-swatch` — drawn in the existing set's stroke/grid
  style.
- [x] Each is available by name via the `IconName` type (type union updated) and renders
  through `Icon` like any built-in.
- [x] Additive: `registerIcon` and existing names untouched.
- [x] Tests assert each new name renders and the type union matches the registry;
  `pnpm test` green, `pnpm pack` clean.
- [x] Documentation updated (docs.config.ts Icon page lists the new glyphs, e.g. in its
  gallery/names table).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]].
- Unblocks [[DS-0088-menu-custom-leading-visual]]'s color-swatch use case.
- Site workaround removed: passoca's `registerIcon` hand-drawn BottomNav paths + custom social SVGs.
