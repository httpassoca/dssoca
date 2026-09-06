---
id: DS-0150
type: story
title: "Inspirations — example websites on the plain-HTML path, deployed to GitHub Pages"
status: done
priority: high
tags: [vanilla, docs, examples, gh-pages, a11y]
depends_on: [DS-0148]
parent: null
epic: null
created: 2026-09-06
updated: 2026-09-06
---

## Description

As someone evaluating dssoca (or picking it up for a static site), I want to see the system
**composed into whole websites** — not one snippet per component — so I can judge how it holds
together, open a real page, view its source and copy what I like. [[DS-0148-vanilla-html-consumption]]
made plain-HTML consumption possible; this story is its showcase: twelve realistic example
sites (an ops dashboard, a social feed, a dating app, a team chat, a SaaS landing page, a
personal blog, a media tracker à la AniList/Letterboxd, a storefront, a mail client, a kanban
board, a music player, an account-settings + sign-in screen), each written by hand in plain
HTML on `dssoca/vanilla.css` + `dssoca/vanilla.js`, plus an **Inspirations** gallery page
(image thumbnails; each opens the site in a new tab) with theme/size toggles that every
opened page honours. Deployed to **GitHub Pages** (`https://httpassoca.github.io/dssoca/`)
from `main` by a GitHub Actions workflow that rebuilds `dist/`, vendors it into the site and
captures the thumbnails in the run — nothing generated is committed.

Decisions (planning interview): name **Inspirations** everywhere (folder `inspirations/`,
scripts `build:inspirations` / `inspirations:dev` / `inspirations:shots`); pages load dssoca
from the **local build** (`inspirations-dist/vendor/`), never a CDN, so they track source and
CI catches contract drift; **image gallery** with CI-generated screenshots (Playwright CLI via
`pnpm dlx`, no repo dependency) and a token-striped placeholder when a thumbnail is missing;
gallery toggles persist in `localStorage` and `assets/axes.js` applies them (or `?theme=&size=`)
on every page; page-level `site.css` is layout-only (tokens, no colour literals, zero radius —
test-enforced); fully self-contained (inline SVG placeholders, no external assets); ships as
minor **0.18.0** together with the already-announced `.ss-table` removal
([[DS-0149-remove-layout-ss-table]]).

## Tasks

- [x] [[DS-0151-inspirations-scaffold-build-deploy]] — build/serve/screenshot scripts, Pages workflow, CI step, ignores.
- [x] [[DS-0152-inspirations-gallery-axes]] — gallery page + `assets/axes.js`.
- [x] [[DS-0153-inspirations-example-pages]] — the twelve sites.
- [x] [[DS-0154-inspirations-tests-docs]] — vitest guard, Sidebar `external`, docs nav/guide, README, CHANGELOG, CLAUDE.md.

## Acceptance criteria

- [x] `pnpm build:inspirations` assembles `inspirations-dist/` from `inspirations/` + the vendored
  `dist/` files (theme.css, vanilla.css, vanilla/index.js and every module it imports); fails
  loudly without `dist/`.
- [x] Twelve sites under `inspirations/<slug>/index.html`, each: plain HTML, loads
  `../vendor/theme.css` → `../vendor/vanilla.css` → `../vendor/vanilla/index.js` + `../assets/axes.js`,
  declares both axes on `<html>`, uses only `ss-*` classes that exist in the generated CSS, one
  `h1`, landmarks, no external assets, no colour literals / radius in its CSS — all pinned by
  `test/unit/inspirations.test.ts`, which also runs axe over every page.
- [x] The gallery links every site (and only those) as a new-tab Card with a thumbnail, blurb
  and component chips; theme/size toggles restyle the gallery and are honoured by opened pages.
- [x] Every page verified in headless Chromium at 1280 and ~390 px, dark + light, with the vanilla
  behaviours (modal, menu, accordion, switch, segmented, toasts, steppers) working; browser axe
  run reports no page-authored serious/critical violations (colour contrast included). Remaining
  component-level light-theme contrast findings are tracked in [[DS-0155-light-theme-tone-contrast]].
- [x] `.github/workflows/pages.yml` deploys on push to `main` + `workflow_dispatch` (Actions
  deployment, `github-pages` environment); thumbnails are captured in the run; CI builds the site.
- [x] Docs: "Inspirations" in the docs nav (external, new tab — via a new Sidebar `external`
  item flag), a pointer in the Plain HTML & CSS guide and README; CHANGELOG; CLAUDE.md layout +
  commands + rules. `pnpm docs:test` green.
- [x] `pnpm lint`, `format:check`, `check`, `test`, `docs:test`, `pack`, `build-storybook` green.
- [x] Documentation updated (docs nav + vanilla guide + README + CHANGELOG + CLAUDE.md).

## Notes

- **Prior art.** Bootstrap "Examples" (whole-page snippets built on the framework — the direct
  model), Tailwind Plus templates, shadcn/ui Blocks & Examples, Bulma Expo, Pico CSS examples;
  Bootstrap's examples are hand-written pages that ship with the docs, which is exactly the
  shape here. Storybook stays the per-component explorer; Inspirations is the per-site one.
- **Why not iframes / committed PNGs.** Live iframes were rejected for an image gallery feel;
  committed PNGs go stale — capturing in the deploy run keeps them honest at zero repo cost.
- **Local preview:** `pnpm inspirations:dev` (needs `pnpm pack` once for `dist/`). Thumbnails
  locally: `pnpm dlx playwright@1.63.0 install --with-deps --only-shell chromium && pnpm inspirations:shots`.
- **Library fixes that fell out of the pages** (all in 0.18.0): the global `a::before` underline
  leaking into Sidebar / BottomNav / Topbar / Card overlay / ServiceCard / SearchPalette anchors;
  the Toaster host missing `role="region"` (axe `aria-prohibited-attr`); vanilla.js's Input clear
  button ignoring `hidden`; MetricTile `.small` / emphasis chip / period contrast; Sidebar
  `external` items. Follow-up filed: [[DS-0155-light-theme-tone-contrast]].
- Not everything is on the vanilla path (Tooltip collision, Toaster swipe, chart tooltips, Image
  lightbox, SearchPalette combobox, Table sorting): the pages wire small page-local `site.js`
  where a demo needs it and otherwise stay static — documented per page in its source.
