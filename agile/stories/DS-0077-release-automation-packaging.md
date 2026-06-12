---
id: DS-0077
type: story
title: "Release automation & packaging polish — changelog, provenance, exports"
status: done
priority: low
tags: [release, packaging, npm]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a maintainer I cut releases without manual checklists. Releasing is currently a
hand-run sequence (bump, branch, tag, `pnpm publish` with OTP); the package exports map
lacks a `default` condition and publishes without npm provenance.

## Acceptance criteria
- [x] Exports map: add `"default": "./dist/index.js"` after `svelte` in both export
  entries of `package.json`; `publint` stays clean. *Added after `svelte` in the `"."`
  entry — the only entry with conditions; `./theme.css` and `./tokens.css` are plain
  string targets (already their own default) and keep working. `pnpm pack` (publint)
  verified clean.*
- [x] Release flow automated or scripted (changesets or release-please): changelog
  generated, tag + GitHub release created from the release PR. *Chose a small local
  script over changesets/release-please (single-maintainer, OTP-gated manual publish —
  a bot flow would fight git-flow): `scripts/release.mjs` (`pnpm release`) validates the
  semver bump against the last tag, checks the `release/<x.y.z>` branch, generates a
  changelog stub from conventional commits since the last tag (`--write` inserts it under
  `## [Unreleased]`), and prints the exact tag/GitHub-release/publish/back-merge steps.
  Initial `CHANGELOG.md` 0.9.0 entry written from real git history. Tag + GitHub release
  remain manual by design (git-flow encoded, not replaced).*
- [x] Publish uses `--provenance` (trusted publishing from CI, or documented in the
  manual flow); CLAUDE.md release section updated to match. *Documented in the manual
  flow (CLAUDE.md Releasing + the script's printed steps). Full trusted-publishing from
  CI (OIDC) is explicitly out of scope — noted in CLAUDE.md.*
- [x] A release dry-run (`pnpm pack`) validated in CI. *Verified: ci.yml's
  "Build + validate package (release dry-run)" step runs `pnpm pack` (prepack →
  svelte-package + CSS + publint → tarball) on every PR.*
- [x] Documentation updated (CLAUDE.md release steps).

## Notes
- Keep git-flow semantics (release/x.y.z → main + back-merge) — automation should encode
  it, not replace it.
