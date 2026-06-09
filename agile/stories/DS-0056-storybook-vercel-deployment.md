---
id: DS-0056
type: story
title: "Storybook deployment on Vercel"
status: done
priority: low
tags: [storybook, infra, deploy]
depends_on: [DS-0015]
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
Deploy the dssoca **Storybook** to Vercel as its own static project, alongside the
already-deployed docs site (`DS-0015`). This unblocks the docs' live per-component
embeds on the deployed site (they iframe Storybook stories via `VITE_STORYBOOK_URL`,
which `DS-0015` left out of scope).

The constraint that drives the design: Vercel reads a **single repo-root
`vercel.json`** per repo (a `documentation/vercel.json` is ignored — confirmed in
`DS-0015`). So two projects from one repo can't each own a config file. Instead the
one root `vercel.json` **branches its `buildCommand` on a `VERCEL_DEPLOY_TARGET` env
var**, leaving the docs build path untouched.

## Acceptance criteria
- [x] Root `vercel.json` `buildCommand` branches on `$VERCEL_DEPLOY_TARGET`:
  - `storybook` → `pnpm -w run prepare && pnpm exec storybook build --output-dir build`
  - else (docs) → `pnpm -w run prepare && pnpm build` (**byte-identical to before**;
    docs deploy unchanged).
- [x] `pnpm exec storybook build --output-dir build` chosen over
  `pnpm build-storybook -- …` because pnpm forwards the literal `--` into Storybook's
  `build` subcommand (`too many arguments`); `pnpm exec` invokes the binary directly.
  Validated locally: emits `index.html` + `iframe.html` + `index.json` (story ids like
  `components-button--primary`).
- [x] `outputDirectory: build` is shared and correct for both — it resolves relative to
  **each project's** Root Directory (docs = `documentation/build`, storybook = repo-root
  `build`). `framework: null` and `trailingSlash: true` unchanged.
- [x] Docs updated: `documentation/CLAUDE.md` (new *Storybook deployment* subsection +
  the dashboard setup + the `VITE_STORYBOOK_URL` wiring) and repo-root `CLAUDE.md`.
- [x] No change to the local workflow: `pnpm storybook` / `pnpm build-storybook` /
  `pnpm docs:*` are untouched (the output-dir override lives only in the Vercel command).
- [x] `pnpm test` + `pnpm docs:test` green; `pnpm pack` clean (vercel.json + *.md aren't
  published).

## One-time Vercel dashboard setup (outside the repo — flagged for the user)
- New Project → import this repo → Root Directory = repo root (default), Framework = "Other".
- Env var **`VERCEL_DEPLOY_TARGET=storybook`** (Production + Preview) on that project.
- On the **docs** project, set **`VITE_STORYBOOK_URL`** = the Storybook deploy URL, then
  redeploy the docs so the per-component embeds resolve.

## Notes
- `trailingSlash: true` is shared. Storybook serves `iframe.html` (file with extension,
  unaffected) and routes by query/hash, so trailing-slash redirects don't bite — verify
  the first deploy's embeds load and revisit if needed.
- Builds on [[DS-0015-vercel-docs-deployment]].
