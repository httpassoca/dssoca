---
id: DS-0015
type: story
title: "Vercel deployment for the documentation site"
status: done
priority: low
tags: [docs, infra, deploy]
depends_on: []
parent: null
epic: null
created: 2026-06-08
updated: 2026-06-08
---

## Description
Deploy the docs site (`dssoca-docs`) to **Vercel** as a static site. The docs dogfood the library by
importing its **source** from `../src`, so the build must run from the **repo root** (Vercel *Root
Directory* = repo root). Keep `adapter-static` (the site is fully prerendered) and let Vercel serve
the `documentation/build/` output — no adapter swap, so the local `pnpm docs:dev` / `docs:preview`
workflow is unchanged.

## Acceptance criteria
- [x] Add `vercel.json` at the **repo root**: `framework: null`, `buildCommand: pnpm docs:build`,
  `outputDirectory: documentation/build`, `trailingSlash: true` (matches the docs'
  `trailingSlash: 'always'` so prerendered `route/index.html` files resolve).
- [x] Keep `@sveltejs/adapter-static` (with the existing `404.html` fallback, which doubles as
  Vercel's not-found page) — no `adapter-vercel`, no change to the local build/preview workflow.
- [x] Document the setup + the one-time Vercel dashboard step (Root Directory = repo root, framework
  "Other") in `documentation/CLAUDE.md`; refresh the stale "local-only / no deploy" notes there and
  in `svelte.config.js`.
- [x] `pnpm test` green; `pnpm docs:build` clean and writes `documentation/build/`; `pnpm pack`
  unaffected (docs aren't published); agile + board rebuilt.

## Notes
- **Storybook embeds:** the per-component pages iframe live stories from `STORYBOOK_URL` (default
  `http://localhost:6006`). On the deployed site they're blank unless `VITE_STORYBOOK_URL` is set (a
  Vercel env var) to a deployed Storybook. Deploying Storybook is **out of scope** for this story.
- The actual Vercel project link (import repo, set Root Directory) is a one-time dashboard action
  outside the repo; `vercel.json` makes the build reproducible once linked.
- Builds on [[DS-0010-custom-docs-site]]; follows [[DS-0014-docs-polish-remove-passocamark]].
