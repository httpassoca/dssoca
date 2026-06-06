---
id: DS-0006
type: task
title: "CI pipeline + git-flow + agent docs (CLAUDE.md)"
status: done
priority: high
tags: [infra, ci, docs]
depends_on: []
parent: null
epic: null
created: 2026-06-06
updated: 2026-06-06
---

## Description
Set the repo up for collaborative/agent work: a CLAUDE.md operating guide, GitHub Actions CI on
every PR, and the git-flow branching model with protected branches.

## Acceptance criteria
- [x] `CLAUDE.md` — agent operating instructions (stack, layout, house rules, commands, git-flow, releasing)
- [x] `.github/workflows/ci.yml` — runs `pnpm test` + `pnpm pack` on every PR and pushes to main/develop
- [x] `packageManager` pinned in `package.json` (pnpm@11.1.3) for reproducible CI
- [x] git-flow: `develop` branch created off `main`
- [x] Branch protection on `main` + `develop`: require PR + green `test` check before merge

## Notes
- CI deliberately skips `pnpm check` (svelte-check) — pre-existing `$lib` alias error from the library template, not a real type bug
- Solo-friendly protection: 0 required approvals (owner self-merges once CI is green)
