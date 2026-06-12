---
id: DS-0086
type: story
title: "Spinner component"
status: todo
priority: high
tags: [ui, components, a11y]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a `dssoca` consumer, I want a standalone **Spinner** loading indicator. `Button` already
embeds one for its loading state, but it is private — nothing exportable exists for
empty-page or inline loading, so passoca (and any consumer) must draw its own and match the
DS look by eye. Extract/build the spinner as a first-class component so the same glyph serves
Button, page-level loading, and inline "fetching…" affordances.

## Acceptance criteria
- [ ] `Spinner` component with `.ss-spinner` identity root, exported from the barrel.
- [ ] Sized from `--ss-*` tokens (rescales across sm/md/lg) with a size override for inline
  vs page-level use; zero border-radius; respects `prefers-reduced-motion`.
- [ ] Announced correctly to AT (e.g. `role="status"` + accessible label) — WCAG 2.2 AA.
- [ ] `Button`'s loading state reuses it (or shares its markup/tokens) so the two never drift.
- [ ] Tests cover rendering, a11y role/label, and reduced-motion; `pnpm test` green,
  `pnpm pack` clean.
- [ ] Documentation updated (new docs.config.ts component page; `docs/tokens.md` for any new tokens).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]].
- Site workaround removed: passoca's hand-rolled loading indicators for page/inline states.
