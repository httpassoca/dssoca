---
id: DS-0077
type: story
title: "Release automation & packaging polish — changelog, provenance, exports"
status: todo
priority: low
tags: [release, packaging, npm]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a maintainer I cut releases without manual checklists. Releasing is currently a
hand-run sequence (bump, branch, tag, `pnpm publish` with OTP); the package exports map
lacks a `default` condition and publishes without npm provenance.

## Acceptance criteria
- [ ] Exports map: add `"default": "./dist/index.js"` after `svelte` in both export
  entries of `package.json`; `publint` stays clean.
- [ ] Release flow automated or scripted (changesets or release-please): changelog
  generated, tag + GitHub release created from the release PR.
- [ ] Publish uses `--provenance` (trusted publishing from CI, or documented in the
  manual flow); CLAUDE.md release section updated to match.
- [ ] A release dry-run (`pnpm pack`) validated in CI.
- [ ] Documentation updated (CLAUDE.md release steps).

## Notes
- Keep git-flow semantics (release/x.y.z → main + back-merge) — automation should encode
  it, not replace it.
