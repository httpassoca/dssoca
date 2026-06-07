---
id: DS-0010
type: story
title: "Custom documentation site (shadcn-style)"
status: todo
priority: high
tags: [docs, tooling, dx]
depends_on: [DS-0011, DS-0012, DS-0013]
parent: null
epic: null
created: 2026-06-07
updated: 2026-06-07
---

## Description
As the design-system maintainer, I want a **custom documentation site** — in the spirit of
[ui.shadcn.com](https://ui.shadcn.com/) but for dssoca — that **dogfoods the design system** for
its own UI, covers only the content that exists today, and **connects to Storybook** by embedding
the live stories. Storybook stays the interactive playground; this site is the narrative + reference
home. Sequenced last so it documents the final config, size, and a11y state.

## Acceptance criteria
- [ ] Docs site built in this repo with **SvelteKit + mdsvex** (the current `src/routes` showcase evolves into it); pages authored in `.svx` (Markdown + Svelte); the site's own chrome is built from dssoca components/tokens (dogfooding)
- [ ] shadcn-style structure: landing + left-nav with **Introduction**, **Installation / Getting Started**, **Theming & config** (the theme axis + size system + `dssoca.config.ts`), **Tokens** (a live swatch/scale gallery rendered from the real `--ss-*` vars), and **a page per component**
- [ ] Each component page **embeds its Storybook story inline** (iframe to the deployed Storybook) for a live interactive demo, plus usage/code and an "Open in Storybook" link
- [ ] Content limited to **what exists today** (the ~14 components, the theme axis, the size system, tokens) — no speculative/future content
- [ ] Deployed to **GitHub Pages** via `adapter-static` (CI workflow); Storybook built + deployed alongside (e.g. `/storybook`) so the embeds resolve
- [ ] Add `CHANGELOG.md` (Keep a Changelog; backfill 0.1.0 → current), `CONTRIBUTING.md`, and README version/CI badges
- [ ] Docs site + Storybook build succeed in CI; the docs app is **not** shipped in the npm tarball (`pnpm pack` stays clean); `pnpm test` green; agile + board rebuilt

## Notes
- Build choice confirmed: SvelteKit + mdsvex, dogfood dssoca, **embed Storybook stories inline**
  (iframe) rather than only linking out. Keep embeds pointed at the deployed Storybook URL so they
  stay in sync.
- mdsvex integrates as a Svelte preprocessor (`.svx`); the project already uses `vitePreprocess`
  for SCSS — confirm the two compose, or add the mdsvex preprocessor alongside.
- GitHub Pages base-path: SvelteKit `paths.base` likely needs the repo name; the inline Storybook
  iframes must use the deployed Storybook path.
- Depends on the other three so the docs reflect the final API: theme axis + `dssoca.config.ts`
  ([[DS-0011-design-system-config-file]]), the size system ([[DS-0012-config-driven-size-system]]),
  and the a11y notes ([[DS-0013-accessibility-pass]]).
- Research: ui.shadcn.com structure, mdsvex, Storybook embedding/composition, Keep a Changelog.
- Effort: largest of the four — it's a small site, CI deploy, and per-component pages.
