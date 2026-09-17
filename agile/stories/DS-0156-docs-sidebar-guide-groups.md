---
id: DS-0156
type: story
title: "Docs sidebar — split the top links into guide / configuration / explore groups"
status: todo
priority: high
tags: [docs, navigation, ia]
depends_on: []
parent: null
epic: null
created: 2026-09-07
updated: 2026-09-07
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

- [ ] `NAV` carries three groups above `components`, each with its own `section` key; the sidebar
  renders a visible group label/separator per group (Sidebar already supports sections — reuse it,
  don't invent chrome).
- [ ] Every existing guide page still appears exactly once, keeps its `href`, `icon` and
  `keywords`; the `external` flag on Inspirations still opens in a new tab.
- [ ] Search (`documentation/src/lib/search.ts`) and any nav-driven prev/next or breadcrumb chrome
  still resolve every page; no dead entries.
- [ ] Renders correctly in both themes, all three size variants, and at mobile width (collapsed
  sidebar / drawer) — group labels don't break the collapsed state.
- [ ] `pnpm docs:test` green (extend it to pin the group membership so the split can't silently
  regress); `pnpm lint`, `format:check`, `check`, `test` green.
- [ ] Documentation updated (docs nav is itself the doc; note the grouping in the docs README/
  `docs.config.ts` comment so future pages land in the right group).

## Notes

- Prior art: Tailwind ("Getting started" / "Core concepts" / "Base styles"), shadcn/ui
  ("Get Started" / "Installation" / "Dark mode"), MUI ("Getting started" / "Customization" /
  "Templates"), Radix ("Overview" / "Guides" / "Components") — all shelve the entry path away from
  the configuration surface.
- Files: `documentation/src/lib/docs.config.ts` (`NAV`), the sidebar consumer in
  `documentation/src/lib/layouts/`, `documentation/src/lib/search.ts`.
- Any new page added later must declare which of the three groups it belongs to.
