---
id: DS-0075
type: story
title: "CI hardening — docs tests, Storybook build, coverage, lint"
status: todo
priority: high
tags: [ci, tooling]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a maintainer, CI catches what the rules require. Today `.github/workflows/ci.yml`
runs only `pnpm test` + `pnpm pack` — the docs suite, Storybook build, lint and coverage
are unchecked, so "keep `pnpm docs:test` green" is enforced by convention only.

## Acceptance criteria
- [ ] CI runs `pnpm docs:test` (documentation workspace).
- [ ] CI runs `pnpm build-storybook` so a broken story can't merge.
- [ ] Coverage collected (vitest v8 provider) and surfaced in CI (artifact or summary).
- [ ] ESLint + Prettier introduced (eslint-plugin-svelte, svelte prettier plugin), a
  `lint` script added, and CI runs it; codebase formatted/lint-clean in the same PR.
- [ ] Workflow has `concurrency` with cancel-in-progress; action versions current;
  Node 24 pinned to match `engines`.
- [ ] All checks green on the PR that introduces them.

## Notes
- No user-facing docs surface beyond updating CLAUDE.md's CI description.
- Depends loosely on [[DS-0070-size-variant-test-coverage]] for the coverage config.
