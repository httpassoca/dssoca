---
id: DS-0085
type: story
title: "Container/Page component"
status: done
priority: high
tags: [ui, components, layout]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer, I want a **Container/Page** wrapper — a centered, max-width
page-content element with the standard page paddings — as a layout component or a documented
layout class that works **without importing the full `theme.css`**. The app-shell/layout
classes exist today only inside `theme.css`, so passoca keeps its own `AppContent` component
(centered, max-width, page paddings) that re-derives values the DS already owns.

## Acceptance criteria
- [x] A `Container` (or `Page`) layout primitive ships: centered, token-driven max-width and
  page paddings, full-bleed by default at narrow viewports.
- [x] Delivered either as a component (`.ss-container` identity root, scoped SCSS) or as a
  documented standalone layout class consumable without the rest of `theme.css` (coordinate
  with [[DS-0089-tokens-only-entry]]).
- [x] Width/padding read `--ss-*` tokens and rescale across sm/md/lg; zero border-radius.
- [x] Additive: no existing layout class changes meaning.
- [x] Tests cover rendering and token-driven sizing; `pnpm test` green, `pnpm pack` clean.
- [x] Documentation updated (docs.config.ts page or layout docs; `docs/tokens.md` for any new tokens).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]].
- Site workaround removed: passoca's `AppContent` wrapper re-implementing the DS page width/paddings.
