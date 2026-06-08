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
Deploy the docs site (`dssoca-docs`) to **Vercel** as a static site. The Vercel **Root Directory is
`documentation/`**, so the config lives there and uses this package's own scripts. Keep
`adapter-static` (the site is fully prerendered) and let Vercel serve the `build/` output — no
adapter swap, so the local `pnpm docs:dev` / `docs:preview` workflow is unchanged.

## Acceptance criteria
- [x] Add **`documentation/vercel.json`** (the Vercel Root Directory): `framework: null`,
  `buildCommand: pnpm build` (this package's `vite build`), `outputDirectory: build`,
  `trailingSlash: true` (matches the docs' `trailingSlash: 'always'` so prerendered
  `route/index.html` files resolve).
- [x] Keep `@sveltejs/adapter-static` (with the existing `404.html` fallback, which doubles as
  Vercel's not-found page) — no `adapter-vercel`, no change to the local build/preview workflow.
- [x] Document the setup + the one-time Vercel dashboard steps (Root Directory = `documentation`,
  framework "Other", and **enable "Include files outside the Root Directory"** so the `../src`
  dogfooding imports resolve) in `documentation/CLAUDE.md`; refresh the stale "local-only / no
  deploy" notes there and in `svelte.config.js`.
- [x] `pnpm test` green; `pnpm docs:build` clean and writes `documentation/build/`; `pnpm pack`
  unaffected (docs aren't published); agile + board rebuilt.

## Notes
- **Root Directory = `documentation`** means Vercel can't see the repo-root `pnpm docs:build`
  script, so the build uses this package's `pnpm build`. It also means **"Include files outside the
  Root Directory in the Build Step"** must be enabled — the docs read the library source from
  `../src` at build time (kit.alias), which lives above the Root Directory.
- **Storybook embeds:** the per-component pages iframe live stories from `STORYBOOK_URL` (default
  `http://localhost:6006`). On the deployed site they're blank unless `VITE_STORYBOOK_URL` is set (a
  Vercel env var) to a deployed Storybook. Deploying Storybook is **out of scope** for this story.
- The actual Vercel project link (import repo, set Root Directory) is a one-time dashboard action
  outside the repo; `vercel.json` makes the build reproducible once linked.
- Builds on [[DS-0010-custom-docs-site]]; follows [[DS-0014-docs-polish-remove-passocamark]].
