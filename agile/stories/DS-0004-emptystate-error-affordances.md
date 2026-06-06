---
id: DS-0004
type: story
title: "EmptyState + consistent error/empty affordances"
status: done
priority: low
tags: [ui]
depends_on: [DS-0002]
parent: null
epic: null
created: 2026-06-05
updated: 2026-06-06
---

## Description
As an app author, I drop in an `EmptyState` for "no data" and "something went wrong"
cases, so empty lists and failed fetches render a consistent, on-theme affordance
instead of a blank screen in every app.

## Acceptance criteria
- [x] `EmptyState` component exported from the package root with title/message slots
- [x] Renders on-theme (signal-green/near-black) and follows the zero border-radius rule
- [x] Picks up active density (comfy/compact) like the rest of the set
- [x] Used by apps for empty lists and degraded/error states (e.g. when a service is down)

## Notes
- `src/lib/components/EmptyState.svelte`
- Pairs with the Toaster (DS-0003) to satisfy the repo-wide error-handling rule
