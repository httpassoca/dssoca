---
id: DS-0081
type: story
title: "Topbar: optional built-in chrome"
status: todo
priority: high
tags: [ui, topbar, api]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a `dssoca` consumer outside the homelab-dashboard context, I want the Topbar's built-in
chrome to be **opt-out**. The services status dot ("6/7 up"), the stats segments, the ⌘K
command chip, and the live clock are currently hardcoded — a portfolio site like passoca shows
a meaningless "6/7 up" badge and a dead ⌘K chip today. Each piece should be hideable via props
(e.g. `services?: false`, `clock?: false`, and the command chip hidden automatically when no
`onCommand` handler is passed) so the Topbar degrades gracefully to a plain brand + tabs bar.

## Acceptance criteria
- [ ] Services status dot/summary hideable (e.g. `services: false` or absent data ⇒ not rendered).
- [ ] Stats segments hideable the same way.
- [ ] Live clock hideable (`clock: false`).
- [ ] ⌘K command chip renders only when an `onCommand` handler is provided.
- [ ] Defaults preserve today's rendering for existing dashboard consumers (no breaking change).
- [ ] Tests assert each piece can be removed independently and that nothing dead renders;
  `pnpm test` green.
- [ ] Documentation updated (docs.config.ts Topbar prop table + a "minimal Topbar" usage example).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]]; sibling Topbar stories
  [[DS-0080-topbar-link-tabs]] and [[DS-0082-topbar-responsive-tabs]].
- Site workaround removed: passoca currently ships a Topbar advertising "6/7 up" services and a
  ⌘K chip that does nothing.
