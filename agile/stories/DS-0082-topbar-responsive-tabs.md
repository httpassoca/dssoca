---
id: DS-0082
type: story
title: "Topbar: responsive tab strip"
status: todo
priority: high
tags: [ui, topbar, responsive]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a `dssoca` consumer shipping to mobile, I want the Topbar to **behave at narrow viewports**.
Today the tab strip has no responsive behavior: tabs overflow the bar on small screens. The
passoca site papers over this with a global CSS override that hides `.ss-topbar .ws` — exactly
the kind of reach-into-internals hack the scoped-styling rule exists to prevent. The Topbar
should own a strategy: collapse the strip below a breakpoint, or keep priority tabs visible and
move the rest into an overflow menu (the shipped `Menu` component is a natural fit).

## Acceptance criteria
- [ ] At narrow viewports tabs no longer overflow: either the strip collapses (documented
  breakpoint, consumers pair with `BottomNav`) or a priority+overflow-menu pattern keeps the
  bar intact.
- [ ] Behavior is driven by `--ss-*` tokens / documented breakpoints, not hardcoded px.
- [ ] Overflowed tabs (if the menu pattern is chosen) remain keyboard-reachable and announce
  the active tab; WCAG 2.2 AA upheld.
- [ ] No consumer needs to target `.ss-topbar` internals from global CSS.
- [ ] Tests cover the narrow-viewport rendering path; `pnpm test` green.
- [ ] Documentation updated (docs.config.ts Topbar page describes the responsive behavior).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]]; sibling Topbar stories
  [[DS-0080-topbar-link-tabs]] and [[DS-0081-topbar-optional-chrome]].
- Site workaround removed: passoca's global `.ss-topbar .ws { display: none }` override.
