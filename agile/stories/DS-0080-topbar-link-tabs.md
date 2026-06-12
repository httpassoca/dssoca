---
id: DS-0080
type: story
title: "Topbar: link tabs"
status: done
priority: high
tags: [ui, topbar, a11y, routing]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer with a router (SvelteKit), I want **Topbar tabs as links**. Today `tabs`
is a `string[]` rendered as `<button onclick>`, so navigation only works imperatively and the
tab's identity *is* its label. Tabs should also accept objects `{ id, label, href }` rendered as
real `<a href>` with `aria-current` on the active one — giving consumers SSR-friendly/client
routing for free and decoupling the stable `id` from a localized `label`. The passoca site
currently round-trips label strings to identify the active tab and calls `goto()` from the
click handler; this story removes that workaround.

## Acceptance criteria
- [x] `tabs` accepts `Array<{ id: string; label: string; href: string }>` (the existing
  `string[]` form keeps working — additive, no breaking change).
- [x] Object tabs render `<a href>`; the active tab carries `aria-current` (`"page"` for links).
- [x] Active-tab matching uses `id`, not the rendered label, so localized labels don't break it.
- [x] Works without JS (SSR): links navigate natively (link tabs keep the natural tab order, no
  roving `tabindex="-1"`); `onTab`/click callbacks still fire for consumers who want them.
- [x] Tests cover both tab shapes, `aria-current`, and id-based active matching; `pnpm test` green.
- [x] Documentation updated (component-docs Topbar page + usage example with `href` tabs).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]]; sibling Topbar stories
  [[DS-0081-topbar-optional-chrome]] and [[DS-0082-topbar-responsive-tabs]].
- Site workaround removed: label-string round-tripping + `goto()` in the passoca header.
