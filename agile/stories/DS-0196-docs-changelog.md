---
id: DS-0196
type: story
title: "Docs: changelog page, per-component changelogs and a GitHub link"
status: done
priority: low
tags: [docs, changelog, release, dx]
depends_on: []
parent: null
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

As someone upgrading dssoca, I want to see what changed in each release, and what changed in the
one component I use, without leaving the docs. As a maintainer, I do not want a second place to
keep up to date.

- **`/changelog`** renders the repo-root `CHANGELOG.md` release by release (title, date, compare
  link, sections, a jump list). It is parsed at build time; the page has no content of its own.
- **Every component page ends with a "Changelog" section**: that component's changes per release,
  each with a type chip (Added / Changed / Fixed / Removed / Deprecated, plus Breaking) and its
  agile / GitHub references.
- **The GitHub repository link** is a labelled link in the docs top bar (it was an unlabelled
  "external" glyph) and is on the landing page.

## How it stays automatic

One source: `CHANGELOG.md`, which a release already has to write.

- A bullet belongs to a component when it names it in backticks (`` `Switch` ``). If the bullet
  opens with a bold lead that names components, only those count; otherwise every component named
  in the body counts (`documentation/src/lib/changelog.ts` → `componentsIn`).
- `pnpm release` drafts a commit scoped to a component (`fix(switch): …`) as
  "- **`Switch`**: …", so the convention is produced for you. `--write` keeps pending
  `[Unreleased]` notes on top of the new release and updates the compare links
  (`scripts/lib/changelog.mjs`).
- History up to `0.20.0` could not be derived this way (early notes are sparse and rarely name
  components), so it was researched once, one subagent per component, from the git history, pull
  requests, agile items and the changelog, into
  `documentation/src/lib/component-changelog/<slug>.json` (42 files, 194 releases, 388 entries).
  Those files are frozen; releases after `0.20.0` are derived.

## Acceptance Criteria

- [x] `/changelog` lists every release in `CHANGELOG.md`, with anchors per release.
- [x] Every component page ends with its own changelog; each release links to `/changelog`.
- [x] Adding a bullet that names a component to `CHANGELOG.md` shows it on that component's page
      with no other edit (covered by `documentation/test/changelog.test.ts`).
- [x] The nav and the search palette list the Changelog page.
- [x] The top bar and the landing page link the GitHub repository by name.
- [x] `pnpm release` drafts component-scoped commits with the component lead.

## Notes

- The inline Markdown renderer escapes everything and only emits `code`, `strong`, `em` and `a`
  (http(s), root-relative or `#` links), so its output is safe for `{@html}`. Content is
  developer-authored.
- `breaking` in the backfill marks changed default behaviour or markup as well as API breaks; it
  is the researching agent's reading where the changelog did not say so.
- Tests: `documentation/test/changelog.test.ts` (parser, renderer, derivation, backfill schema,
  wiring) and `test/unit/release-changelog.test.ts` (release helpers).
