---
id: DS-0082
type: story
title: "Topbar: responsive tab strip"
status: done
priority: high
tags: [ui, topbar, responsive]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer shipping to mobile, I want the Topbar to **behave at narrow viewports**.
Today the tab strip has no responsive behavior: tabs overflow the bar on small screens. The
passoca site papers over this with a global CSS override that hides `.ss-topbar .ws` — exactly
the kind of reach-into-internals hack the scoped-styling rule exists to prevent. The Topbar
should own a strategy: collapse the strip below a breakpoint, or keep priority tabs visible and
move the rest into an overflow menu (the shipped `Menu` component is a natural fit).

## Acceptance criteria
- [x] At narrow viewports tabs no longer overflow: the strip shrinks (`min-width: 0`) and
  scrolls horizontally instead of pushing the right-side chrome off-canvas; stat segments
  collapse at the documented 720px breakpoint and the strip collapses at 520px (consumers
  pair with `BottomNav`).
- [x] Behavior is driven by documented breakpoints (named Sass constants in the component +
  the Topbar docs page; media queries cannot read CSS custom properties, so these are the
  documented-breakpoint path the criterion allows).
- [x] Overflowed tabs remain keyboard-reachable (focus scrolls them into view natively) and
  the active tab announces via `aria-current="page"`; WCAG 2.2 AA upheld (axe green).
- [x] No consumer needs to target `.ss-topbar` internals from global CSS (use `tabs={[]}` to
  drop the strip entirely).
- [x] Tests cover the narrow-viewport rendering path's structural hooks (single `nav.ws`
  scroll container, `collapsible` stat hooks, keyboard reach of overflowed tabs); the visual
  collapse is exercised in Storybook ("Many Tabs" story). `pnpm test` green.
- [x] Documentation updated (component-docs Topbar page describes the responsive behavior).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]]; sibling Topbar stories
  [[DS-0080-topbar-link-tabs]] and [[DS-0081-topbar-optional-chrome]].
- Site workaround removed: passoca's global `.ss-topbar .ws { display: none }` override.
