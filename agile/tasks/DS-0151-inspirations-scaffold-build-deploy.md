---
id: DS-0151
type: task
title: "Inspirations: build/serve/screenshot scripts, Pages workflow, CI step"
status: done
priority: high
tags: [vanilla, examples]
depends_on: []
parent: DS-0150
epic: null
created: 2026-09-06
updated: 2026-09-06
---

## Description

Zero-dependency tooling for [[DS-0150-inspirations-example-sites]]: `scripts/lib/inspirations.mjs` (slug listing + the vendored-file graph walk), `scripts/build-inspirations.mjs` (assembles `inspirations-dist/` = pages + `vendor/` copy of `dist/theme.css`, `vanilla.css`, `vanilla/index.js` and its imports), `scripts/serve-inspirations.mjs` (static server mirroring GitHub Pages: `/slug` → `/slug/`, index files, ES-module MIME), `scripts/screenshot-inspirations.mjs` (Playwright CLI via `pnpm dlx playwright@1.63.0`, 1280×800 into `thumbs/`). `package.json` scripts `build:inspirations` / `inspirations:dev` / `inspirations:shots`; `inspirations-dist/` ignored by git, Prettier and ESLint. `.github/workflows/pages.yml` (push to `main` + `workflow_dispatch`; build job rebuilds `dist`, assembles, captures thumbnails, `upload-pages-artifact@v5`; deploy job `deploy-pages@v5` in the `github-pages` environment); `ci.yml` gains `pnpm build:inspirations` after `pnpm pack`. GitHub Pages enabled on the repo with `build_type=workflow`.
