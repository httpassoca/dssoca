---
id: DS-0014
type: story
title: "Docs polish + remove PassocaMark; passoca-logo favicon"
status: done
priority: low
tags: [docs, cleanup, breaking]
depends_on: []
parent: null
epic: null
created: 2026-06-08
updated: 2026-06-08
---

## Description
A small batch of documentation-site polish plus the removal of the `PassocaMark` brand-mark
component from the library. The docs site adopts the **passoca logo** (`static/passoca-logo.svg`) as
its favicon and brand glyph in place of `PassocaMark`. **Breaking** for the library: `PassocaMark` is
no longer exported.

## Acceptance criteria
- [x] **Centered article** — guide (`Prose`) and component (`ComponentPage`) articles get
  `margin-inline: auto` so the content column sits centered in the main area instead of hugging the
  sidebar edge.
- [x] **Smooth axis flips (docs only)** — `ThemeControls` arms a transient `html.axis-anim` class
  around each theme/size toggle (forcing a reflow so the change animates rather than snapping);
  `+layout.svelte` defines a one-window global transition
  (color/background/border/fill/padding/font-size/dimensions) eased over `--ss-dur`. The selector
  covers the **root `html`** (which carries the page `background`/`color` in `_base.scss`) **and** all
  descendants, so the dominant page background fades too. Uses the motion tokens, so it collapses to
  0ms under `prefers-reduced-motion` for free.
- [x] **Remove `PassocaMark` entirely** — deleted the component, its Storybook story, its `dssoca`
  export, its `COMPONENT_NAMES` entry, its docs `COMPONENTS` page entry, and its unit test. `Topbar`
  (which embedded it for the `hubssoca` brand) now inlines the mark SVG (`fill: var(--ss-primary)`).
- [x] **Passoca logo on favicon** — `documentation/static/passoca-logo.svg` is the favicon
  (`app.html`) and the docs brand mark (top bar + landing hero, via `<img>`); the old Svelte-logo
  `favicon.svg` was removed.
- [x] Syntax highlighting on guide code blocks was investigated — already working (Prism + `code.css`
  token theme, same path as component `CodeBlock`); no change needed.
- [x] `pnpm test` green; `pnpm docs:test` green; `pnpm docs:build` clean; `pnpm pack` clean (publint);
  agile + board rebuilt.

## Notes
- **Breaking change:** dropping the `PassocaMark` export is a public-API removal — bump accordingly at
  the next release. Historical references in past stories ([[DS-0002-reusable-component-set]],
  [[DS-0007-storybook-component-explorer]], [[DS-0009-scoped-component-styles]],
  [[DS-0012-config-driven-size-system]]) and the `DESIGN.md` 0.4.0 changelog note are left intact as
  records of what existed then.
- The passoca logo is a fixed-green (`#66ef73`) SVG, so the docs brand stays brand-green across
  themes (favicons are theme-agnostic anyway); `Topbar`'s inlined mark still tracks `--ss-primary`.
- Builds on [[DS-0010-custom-docs-site]].
