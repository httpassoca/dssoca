---
id: DS-0010
type: story
title: "Custom documentation site (shadcn-style)"
status: done
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
- [x] Docs site built in this repo with **SvelteKit + mdsvex**; pages authored in `.svx` (Markdown + Svelte); the site's own chrome is built from dssoca components/tokens (dogfooding) — lives in a standalone `documentation/` app (workspace package importing the dssoca source)
- [x] shadcn-style structure: landing + left-nav with **Introduction**, **Installation / Getting Started**, **Theming & config** (the theme axis + size system + `dssoca.config.ts`), **Tokens** (a live swatch/scale gallery rendered from the real `--ss-*` vars), and **a page per component**
- [x] Each component page **embeds its Storybook story inline** (iframe) for a live interactive demo, plus usage/code and an "Open in Storybook" link
- [x] Content limited to **what exists today** (the 14 components, the theme axis, the size system, tokens) — no speculative/future content
- [~] ~~Deployed to GitHub Pages~~ — **deferred (out of scope): local-only per request.** Build uses `adapter-static` so `pnpm docs:build` produces a static site; Storybook embeds default to `http://localhost:6006` (override via `VITE_STORYBOOK_URL`). No CI/deploy workflow added.
- [x] Add `CHANGELOG.md` (Keep a Changelog; backfill 0.1.0 → current), `CONTRIBUTING.md`, and README version/CI badges
- [x] Docs site builds locally (`pnpm docs:build`); the docs app is **not** shipped in the npm tarball (`pnpm pack` stays clean); `pnpm test` green; agile + board rebuilt

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

## Implementation notes (delivered)
- Built as a **standalone SvelteKit + mdsvex app** under `documentation/` (its own `package.json`,
  added to the pnpm workspace), rather than evolving `src/routes`. It dogfoods dssoca by importing
  the library **source** (`../src/lib`, `../src/styles`) via `kit.alias` — no build step needed.
- The old hub-dashboard showcase (`src/routes/+page.svelte`) was **removed** and replaced with a
  stub landing; Storybook + the docs site are now the live previews.
- Per-component pages are a single config-driven dynamic route (`components/[slug]`) fed by
  `documentation/src/lib/docs.config.ts` (the nav + per-component metadata + Storybook story ids).
- Tokens page renders live from the real `--ss-*` vars and updates when the theme/size axes flip.
- Run locally: `pnpm docs:dev` (+ `pnpm storybook` for the embeds). Build: `pnpm docs:build`.
- **Deploy + CI** (GitHub Pages, Storybook co-deploy) intentionally deferred per request.
- **Syntax highlighting:** Prism (shared singleton in `prism-setup.js`) for both `.svx` fences and
  the `CodeBlock` component; token colours mapped to `--ss-code-*` in `styles/code.css` so
  highlighting follows the theme axis. Monospace accents use a new `--ss-lime` token (not cyan).
- **Tests:** minimal Vitest suite (`documentation/test/`) covering the `docs.config` invariants and
  the highlighter — `pnpm docs:test`.
- **Context:** `documentation/CLAUDE.md` documents the docs-app architecture and house rules.
