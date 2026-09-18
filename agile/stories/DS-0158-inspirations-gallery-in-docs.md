---
id: DS-0158
type: story
title: "Inspirations gallery inside the docs site (not just an external link)"
status: done
priority: high
tags: [docs, inspirations, navigation, ia]
depends_on: [DS-0150]
parent: null
epic: null
created: 2026-09-07
updated: 2026-09-18
---

## Description

As a docs reader, I want **Inspirations to be part of dssoca's docs**, not a link that throws me
out to another host. Today the nav entry is `external: true` pointing at
`https://httpassoca.github.io/dssoca/` ([[DS-0150-inspirations-example-sites]]) — the gallery lives
entirely on GitHub Pages, so browsing examples means leaving the site and losing the docs chrome,
the sidebar, search and the theme/size axes.

The Pages host **stays** (the example sites must keep running standalone on the plain-HTML path,
which is the point of the showcase). What changes is that the **gallery page itself also exists at
`/inspirations` on the docs site**: same cards, same blurbs, same component chips, same thumbnails,
rendered inside the docs layout and honouring the docs' own theme/size axes. Each card still opens
its example site in a new tab — on the Pages host, since that's where the sites are served.

**Gallery card layout:** lay the description out in **two rows instead of two columns**. Applies to
the docs gallery and, so the two don't diverge, to the Pages gallery as well.

Design decisions to settle in refinement:

- **One source of truth for the site list.** The blurbs, chips, slugs and thumbnail names must not
  be maintained twice. Extract a shared manifest (a JSON/TS module the Pages gallery and the docs
  page both read, ideally derived by `scripts/build-inspirations.mjs` and consumed by the docs
  build) instead of hand-copying the twelve cards into a Svelte page — a copy will drift within one
  release, exactly like the token bridge in [[DS-0089-tokens-only-entry]].
- **Thumbnails.** They're generated in the Pages workflow and never committed. The docs page can
  hot-link the Pages thumbnail URLs (simplest, zero repo weight, but a hard dependency on the Pages
  deploy) or generate its own during the docs build. Pick one; keep the token-striped placeholder
  fallback either way.
- **Nav entry.** `/inspirations` becomes an internal item (drop `external`, keep `film` and the
  keywords) and joins the "explore" group from [[DS-0156-docs-sidebar-guide-groups]]. The page keeps
  a prominent link to the standalone Pages host.

## Acceptance criteria

- [x] `/inspirations` exists on the docs site, prerenders, and lists every example site — the same
  set the Pages gallery lists, from a shared manifest, with no hand-duplicated card copy.
- [x] Each card links to its site on the Pages host, opens in a new tab (`rel="noopener
  noreferrer"`), and carries the thumbnail (or the placeholder when one is missing).
- [x] The card's description is laid out as **two rows, not two columns**, on both galleries.
- [x] The nav entry is internal, sits in the explore group, and search finds the page.
- [x] The standalone Pages gallery keeps working unchanged apart from the description layout; the
  example sites are untouched.
- [x] Both themes, all three size variants, mobile width; axe clean; `pnpm docs:test` extended to
  pin the page's presence and that the docs gallery and the manifest agree.
- [x] `pnpm lint`, `format:check`, `check`, `test`, `docs:test`, `pack` green.
- [x] Documentation updated (docs nav, the Plain HTML & CSS guide pointer, README, CLAUDE.md's
  `inspirations/` layout note, CHANGELOG).

## Notes

- Prior art: Bootstrap's Examples and Tailwind Plus templates both live *inside* the docs IA while
  the examples themselves open standalone; shadcn/ui Blocks does the same.
- Files: `inspirations/index.html` + `inspirations/site.css` (row layout, manifest extraction),
  `scripts/build-inspirations.mjs`, `documentation/src/lib/docs.config.ts` (`NAV`), a new
  `documentation/src/routes/inspirations/` page, `test/unit/inspirations.test.ts`,
  `documentation/` docs tests.
- The exact element to restack is the gallery card's description block — confirm against
  `inspirations/index.html` (`.ss-card` → `.head`/`.heading`/`.body`) with the owner before
  implementing, since "the description" could mean the title/subtitle pair or the blurb + chips.


## Decisions (2026-09-18)

- **One manifest.** `inspirations/manifest.json` (`slug`, `title`, `kind`, `blurb`,
  `components[]`) is the single source of the cards. `scripts/lib/inspirations.mjs` gained
  `loadManifest()` (validates shape, slugs, duplicates), `renderGalleryCard()` /
  `renderGallery()` (fills the `<!-- inspirations:cards -->` marker in the source `index.html`
  at build time, on the exact vanilla Card DOM) and `thumbAlt()`. `build-inspirations.mjs`
  fails when the manifest and the folders disagree. The docs page imports the same JSON via a
  new `@dssoca/inspirations` alias. Chips must be real component names (pinned by both suites).
- **Thumbnails hot-linked** from the Pages host (`…/thumbs/<slug>.png`) — zero repo weight, no
  Chromium in the docs build; the striped placeholder shows when the Pages deploy doesn't have
  one yet (a site added on `develop` before its release). The prerendered `<img>` can error
  before hydration, so a mount-time `complete && naturalWidth === 0` check backs the `onerror`.
- **`Card` `external` prop** added (target `_blank`, `rel="noopener noreferrer"`, "(opens in a
  new tab)" announcement — Sidebar's convention) so the docs cards open the example off-site
  without a bespoke anchor; the vanilla gallery already rendered that DOM.
- **"Two rows instead of two columns"** read as the card *head*: the component lays the heading
  block (title over kind) beside the actions/↗ column; both galleries now put the title and the
  ↗ on row 1 and the kind on row 2 spanning the width (`.insp-grid .ss-card .head` in
  `site.css`, mirrored with `:global` in the docs page). The `.body` (blurb, then chips) was
  already stacked. **Owner to confirm** this is the block meant — the story flagged the
  ambiguity; flipping the interpretation is a CSS-only change in those two places.
- Nav: `/inspirations` internal in the Explore group (DS-0156), `film` icon + keywords kept;
  search hint "Explore". The page links the standalone Pages host in its intro.
- Verified: docs build prerenders `/inspirations`; headless Chromium pass in both themes, all
  sizes and at 390px, axe (axe-core) clean, cards `target=_blank rel=noopener noreferrer`,
  placeholders shown when the thumbnail URL 404s.
