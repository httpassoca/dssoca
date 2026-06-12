---
id: DS-0083
type: story
title: "Heading component"
status: done
priority: high
tags: [ui, components, typography]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer, I want a **Heading** component for display/page titles — the
accent-underline recipe (`.hs-display`-style span underline) with `centered` and `accent`
options and a heading-level prop (`h1`…`h6`) so semantics and styling stay independent. Today
the recipe exists only as global classes inside `theme.css`, which token-bridge consumers (who
can't import `theme.css`, see [[DS-0089-tokens-only-entry]]) must copy by hand — passoca
recreated the whole thing inside its `AppTitle` component, which will drift from the DS.

## Acceptance criteria
- [x] `Heading` component with `.ss-heading` identity root: accent-underline span treatment,
  `centered` and `accent` boolean options, and a `level` prop rendering the matching `h1`–`h6`.
- [x] Styled in scoped SCSS from `--ss-*` tokens (rescales across sm/md/lg); zero border-radius.
- [x] Usable without importing `theme.css` (component carries its own recipe; pairs with
  [[DS-0089-tokens-only-entry]]).
- [x] Additive: new file + barrel export; existing `theme.css` classes untouched (or aliased to
  the same tokens).
- [x] Tests cover level rendering and option combinations; `pnpm test` green, `pnpm pack` clean.
- [x] Documentation updated (new docs.config.ts component page; `docs/tokens.md` for any new tokens).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]].
- Site workaround removed: passoca's `AppTitle` hand-copy of the `theme.css` display-heading recipe.
