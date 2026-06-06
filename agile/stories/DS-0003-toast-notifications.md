---
id: DS-0003
type: story
title: "Toast notifications (Toaster + toast API)"
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
As an app author, I mount a single `<Toaster />` and call an imperative `toast(...)`
from anywhere to surface transient feedback (success/error), so apps get consistent
notifications without wiring their own state.

## Acceptance criteria
- [x] `<Toaster />` component renders the stack and is exported from the package root
- [x] Imperative `toast` API enqueues notifications from any module (no prop drilling)
- [x] Toasts honor the active theme/density and the zero border-radius rule
- [x] Used by apps as the standard channel for error/success feedback

## Notes
- `src/lib/components/Toaster.svelte` (component) + `src/lib/toast.svelte.ts` (reactive store + `toast` API)
- Backs the project-wide error-handling rule (uniform toast feedback across apps)
