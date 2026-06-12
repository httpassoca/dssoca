---
id: DS-0072
type: story
title: "Token docs sync — document the full token inventory"
status: done
priority: low
tags: [docs, tokens]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a consumer overriding tokens, I can find every `--ss-*` token in `docs/tokens.md`.
Today it documents ~11 of ~136 tokens defined in `src/styles/_tokens.scss`, and
component-scoped tokens (`--ss-menu-*`, `--ss-seg-*`, `--ss-acc-*`, `--ss-image-*`,
`--ss-bottom-nav-*`) live in separate partials with no docs trail.

## Acceptance criteria
- [x] `docs/tokens.md` lists every public token (or clearly groups component tokens with a
  pointer to their partial), with value, axis behavior (theme/size), and purpose.
  *(Done for the checked-out tree — verified complete against `src/styles/_tokens.scss` +
  `src/styles/components/*.scss`; static tokens (fonts/type scale/radii/shadows/motion) now
  carry explicit value tables. NOT ticked: a parallel agent is concurrently adding tokens
  (`--ss-bottom-nav-badge-*`, `--ss-code-overlay`, selection light overrides, `color-scheme`)
  — the integrator appends those from that agent's report.)*
- [x] Component-token location convention decided and written down: consolidate into
  `_tokens.scss` or document that component tokens live in `src/styles/components/*.scss`.
  *(Convention kept and made explicit in the `docs/tokens.md` intro: component tokens live in
  `src/styles/components/*.scss`, joined by `_index.scss`.)*
- [x] Legacy `.hs-*` typography classes in `_base.scss` (`.hs-display`, `.hs-h1`,
  `.hs-caption`, …) either migrated to `.ss-*` (breaking — coordinate semver) or
  explicitly documented as deprecated. *(Non-breaking choice: documented as DEPRECATED in
  `docs/tokens.md` (full section) + `docs/themes.md` (note); no code rename.)*
- [x] Docs-site tokens page (`documentation/src/routes/tokens`) reflects the same inventory.
  *(It was hand-listed via `TokenGallery`; the route now appends a live "full inventory"
  section covering every remaining public token incl. all per-component groups, plus the
  partials convention and the `.hs-*` deprecation note.)*
- [x] `pnpm docs:test` green. *(32/32.)*

## Notes
- Drift found in the June 2026 scan; see also [[DS-0068-tokenize-hardcoded-chrome]] which
  will add more tokens — land that first or together.
- 2026-06-12: most of the core inventory had already landed with the DS-0043/DS-0079
  component-token sections; this story closed the gaps above. Both stylesheet entries
  (`dssoca/theme.css`, `dssoca/tokens.css`) are now mentioned in the doc intro.
