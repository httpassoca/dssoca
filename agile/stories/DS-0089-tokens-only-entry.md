---
id: DS-0089
type: story
title: "Tokens-only stylesheet entry"
status: todo
priority: high
tags: [tokens, packaging, theming]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a `dssoca` consumer with my own global styles, I want a **`dssoca/tokens.css` entry** that
ships the design tokens only — no global element styles, no webfont `@import`. `theme.css`
today restyles `a`, headings, `code`, and scrollbars, and pulls Google Fonts, so a site that
already owns those surfaces can't import it. passoca's bridge is the cautionary tale: it
hand-copied ~80 `--ss-*` token values into a local file so the components could resolve their
custom properties — a copy that silently drifts with every dssoca release.

## Acceptance criteria
- [ ] New `dssoca/tokens.css` export: all `--ss-*` tokens for both `data-theme` values and all
  `data-size-variant` values — and nothing else (no element selectors, no `@import`).
- [ ] Built from the same Sass token partials as `theme.css` (single source of truth — the two
  can never disagree).
- [ ] Wired into `package.json` `exports` + the `build:css`/`prepack` pipeline; `pnpm pack`
  clean (publint).
- [ ] Components render correctly with only `tokens.css` imported (verified by test or
  showcase route).
- [ ] `theme.css` behavior unchanged for existing consumers.
- [ ] Tests/CI cover the new artifact's presence and token completeness; `pnpm test` green.
- [ ] Documentation updated (`docs/tokens.md` + `docs/themes.md` describe the two entries and
  when to use which; README install section mentions it).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]]. [[DS-0083-heading-component]] and
  [[DS-0085-container-component]] assume this entry exists for theme-less consumers.
- Site workaround removed: passoca's hand-maintained ~80-value token bridge file.
