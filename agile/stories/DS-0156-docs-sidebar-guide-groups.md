---
id: DS-0156
type: story
title: "Docs sidebar — split the top links into guide / configuration / explore groups"
status: done
priority: high
tags: [docs, navigation, ia]
depends_on: []
parent: null
epic: null
created: 2026-09-07
updated: 2026-09-18
---

## Description

As someone reading the docs site, I want the top of the left nav **split into labelled groups**
instead of one flat run of nine links, so I can tell "what I must read to start" apart from
"how I configure it" and "things to browse".

Today `NAV` in `documentation/src/lib/docs.config.ts` has a single `section: 'guide'` group holding
Introduction, Installation, Theming & config, Color theory, Tokens, Theme Builder, Keyboard,
Plain HTML & CSS, Inspirations and All components — followed by the alphabetical `components`
group. Everything above the component list reads with equal weight, so the two pages a newcomer
actually needs (install it, then use it) sit next to a palette generator and an examples gallery.

**Three groups, in this shape** (the owner explicitly left names and ordering to us — pick the
clearest labels during refinement, don't treat the words below as final):

1. **Guide** — only the necessary path: Introduction, Installation, Plain HTML & CSS.
2. **Configuration** — the knobs: Theming & config, Tokens, Theme Builder, Keyboard.
3. **Explore** — the browsable surfaces: Inspirations, Color theory, All components.

Purely an information-architecture change: no page is added, removed or renamed, no URL moves.
The `components` group below is untouched.

## Acceptance criteria

- [x] `NAV` carries three groups above `components`, each with its own `section` key; the sidebar
  renders a visible group label/separator per group (Sidebar already supports sections — reuse it,
  don't invent chrome).
- [x] Every existing guide page still appears exactly once, keeps its `href`, `icon` and
  `keywords`; the `external` flag on Inspirations still opens in a new tab.
- [x] Search (`documentation/src/lib/search.ts`) and any nav-driven prev/next or breadcrumb chrome
  still resolve every page; no dead entries.
- [x] Renders correctly in both themes, all three size variants, and at mobile width (collapsed
  sidebar / drawer) — group labels don't break the collapsed state.
- [x] `pnpm docs:test` green (extend it to pin the group membership so the split can't silently
  regress); `pnpm lint`, `format:check`, `check`, `test` green.
- [x] Documentation updated (docs nav is itself the doc; note the grouping in the docs README/
  `docs.config.ts` comment so future pages land in the right group).

## Notes

- Prior art: Tailwind ("Getting started" / "Core concepts" / "Base styles"), shadcn/ui
  ("Get Started" / "Installation" / "Dark mode"), MUI ("Getting started" / "Customization" /
  "Templates"), Radix ("Overview" / "Guides" / "Components") — all shelve the entry path away from
  the configuration surface.
- Files: `documentation/src/lib/docs.config.ts` (`NAV`), the sidebar consumer in
  `documentation/src/lib/layouts/`, `documentation/src/lib/search.ts`.
- Any new page added later must declare which of the three groups it belongs to.

## Decisions (2026-09-18)

- Labels: **Getting started** / **Configuration** / **Explore** (+ the existing **Components**).
  "Getting started" over "Guide" because it is the label newcomers already scan for (Tailwind,
  MUI, Bootstrap); "Configuration" matches the library's own vocabulary (`applyDesignConfig`,
  the "Theming & config" page).
- `NavGroup` gained a stable `section: NavSection` key (`getting-started` | `configuration` |
  `explore` | `components`) **and** a rendered `label`; code keys on the former, the Sidebar
  shows the latter, so wording can change without touching search or tests. `GUIDE_SECTIONS`
  + `guideEntries()` replace the old `section === 'guide'` lookups.
- Search palette hints now name the page's group ("Tokens · Configuration",
  "Inspirations · Explore · opens in a new tab") instead of a flat "Guide".
- Membership/order pinned exactly in `documentation/test/docs.config.test.ts`; adding a page
  without choosing a group fails the suite. Documented in `documentation/CLAUDE.md` house rules.
- Verified: docs build prerenders all four headings; both themes, three sizes and the 720px
  stacked layout checked in headless Chromium.
