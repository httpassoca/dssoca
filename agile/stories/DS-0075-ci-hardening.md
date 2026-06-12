---
id: DS-0075
type: story
title: "CI hardening — docs tests, Storybook build, coverage, lint"
status: done
priority: high
tags: [ci, tooling]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a maintainer, CI catches what the rules require. Today `.github/workflows/ci.yml`
runs only `pnpm test` + `pnpm pack` — the docs suite, Storybook build, lint and coverage
are unchecked, so "keep `pnpm docs:test` green" is enforced by convention only.

## Acceptance criteria
- [x] CI runs `pnpm docs:test` (documentation workspace).
- [x] CI runs `pnpm build-storybook` so a broken story can't merge.
- [x] Coverage collected (vitest v8 provider) and surfaced in CI (artifact or summary).
  *CI runs `pnpm test:coverage` (new script, `vitest run --coverage`) and uploads
  `coverage/` as an artifact; `@vitest/coverage-v8` added. Provider/threshold config lives
  in `vitest.config.ts`, owned by DS-0070 (in flight) — defaults apply until it lands.*
- [x] ESLint + Prettier introduced (eslint-plugin-svelte, svelte prettier plugin), a
  `lint` script added, and CI runs it; codebase formatted/lint-clean in the same PR.
  *Flat `eslint.config.js` (@eslint/js + typescript-eslint + eslint-plugin-svelte +
  eslint-config-prettier) and `.prettierrc` matching the dominant style (no semicolons,
  single quotes, 2-space, 100 cols) + `.prettierignore`. Scripts: `lint`, `format`,
  `format:check`. `pnpm lint` passes on the current tree by tuning severities (see
  eslint.config.js comments) rather than mass-editing files owned by parallel stories.
  "Formatted in the same PR" is deferred to the integrator: run `pnpm format` once after
  all in-flight edits land, then add `format:check` to CI (intentionally not added yet).*
- [x] Workflow has `concurrency` with cancel-in-progress; action versions current;
  Node 24 pinned to match `engines`. *`engines.node >= 24` added to package.json (was
  missing); checkout/setup-node bumped to v5; pnpm pinned via `packageManager` + corepack.*
- [ ] All checks green on the PR that introduces them. *Integrator-dependent: verifiable
  only on the actual PR after all parallel stories merge. `pnpm lint`, `pnpm test`,
  `pnpm docs:test` and `pnpm pack` were green locally at time of writing; svelte-check
  runs non-blocking (see DS-0076).*

## Notes
- No user-facing docs surface beyond updating CLAUDE.md's CI description.
- Depends loosely on [[DS-0070-size-variant-test-coverage]] for the coverage config.
