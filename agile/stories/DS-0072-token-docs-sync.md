---
id: DS-0072
type: story
title: "Token docs sync — document the full token inventory"
status: todo
priority: low
tags: [docs, tokens]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a consumer overriding tokens, I can find every `--ss-*` token in `docs/tokens.md`.
Today it documents ~11 of ~136 tokens defined in `src/styles/_tokens.scss`, and
component-scoped tokens (`--ss-menu-*`, `--ss-seg-*`, `--ss-acc-*`, `--ss-image-*`,
`--ss-bottom-nav-*`) live in separate partials with no docs trail.

## Acceptance criteria
- [ ] `docs/tokens.md` lists every public token (or clearly groups component tokens with a
  pointer to their partial), with value, axis behavior (theme/size), and purpose.
- [ ] Component-token location convention decided and written down: consolidate into
  `_tokens.scss` or document that component tokens live in `src/styles/components/*.scss`.
- [ ] Legacy `.hs-*` typography classes in `_base.scss` (`.hs-display`, `.hs-h1`,
  `.hs-caption`, …) either migrated to `.ss-*` (breaking — coordinate semver) or
  explicitly documented as deprecated.
- [ ] Docs-site tokens page (`documentation/src/routes/tokens`) reflects the same inventory.
- [ ] `pnpm docs:test` green.

## Notes
- Drift found in the June 2026 scan; see also [[DS-0068-tokenize-hardcoded-chrome]] which
  will add more tokens — land that first or together.
