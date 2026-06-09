---
id: DS-0062
type: story
title: "Docs components overview page (/components)"
status: done
priority: high
tags: [docs, components, nav]
depends_on: []
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
A single catalog page at **`/components`** showing every component with a live
preview, in a **3-per-line grid grouped by category**. The homepage's "Browse
components" button points here.

## Acceptance criteria
- [x] New route `documentation/src/routes/components/+page.svelte` → `/components`
  (static route, auto-prerendered; coexists with `components/[slug]`).
- [x] **Categories** are a single source of truth: `documentation/src/lib/categories.ts`
  (Forms & controls · Navigation · Layout · Data display · Feedback · Media). A
  `categories.test.ts` invariant proves every component is covered exactly once.
- [x] Grid is **3 per line** (→ 2 / 1 on narrower viewports), each cell a card
  that links to the component's full page; category section headers between groups.
- [x] **Live previews**, rendered with representative props from each component's
  canonical usage. Rendered **client-only** (`{#if browser}`) so 19 components never
  run through SSR/prerender (the static build can't break on a DOM-touching render);
  the SSR shell still ships the categories, names, taglines, and links.
- [x] Previews are **non-interactive**: the whole card is the link, stages are
  `pointer-events:none`, and a `transform` makes each stage the containing block so
  `position:fixed`/popover components (BottomNav, Menu) can't escape their card.
  Toaster (global store + fixed host) uses a faithful static stand-in.
- [x] Nav entry "All components" added to the guide group; the homepage **Browse
  components** button now targets `/components`.
- [x] `pnpm docs:test` green (categories invariants); `pnpm docs:build` clean
  (`/components/index.html` prerendered, all `[slug]` pages intact).

## Notes
- Self-contained: no Storybook dependency (unlike the per-component pages' live
  embeds), so the catalog renders immediately.
- The homepage redesign ([[DS-0060-docs-home-redesign]]) rewrites `+page.svelte`
  and keeps the same Browse → `/components` target.
