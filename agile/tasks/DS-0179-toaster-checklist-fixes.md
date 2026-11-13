---
id: DS-0179
type: task
title: "Toaster: Front-End Checklist fixes"
status: done
priority: low
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Fixes the Toaster findings from the Front-End Checklist audit (GitHub issue #139), in
`Toaster.svelte` and its vanilla port `vanilla/toast.ts`.

### Medium · `aria-live-regions`, `accessible-notifications` — fixed

Each toast used to be inserted already carrying `role=status|alert` + `aria-live`, which
NVDA/JAWS often skip, and a `status` → `alert` flip on the same node isn't reliably announced.
The Toaster now always renders two visually hidden live regions inside `.ss-toaster`:
`.live[role=status][aria-live=polite]` and `.live[role=alert][aria-live=assertive]`. Each
visible toast mirrors its message into one of them as a `<p>` (errors assertive, all other kinds
polite; a kind change moves the node to the other region, a dismiss removes it). The visual
toasts drop their live role and become a focusable `role="group"` named by their `.msg`
(`aria-labelledby`). Vanilla: the same regions are reused when authored in the markup, otherwise
added to the container on DOM ready (`toasts.prepare()`) or on first use; when the regions were
just created, the first write is deferred 100 ms so screen readers register them first.

### Low · `focus-management` — fixed

- Dismissing the toast that holds focus (×, Escape, action, swipe, programmatic) now moves
  focus to the next toast, else the previous one, else back to the element focus came from
  before it entered the stack (Svelte: a `$effect.pre` on `toasts.items`; vanilla: in `dismiss`).
- `pointerleave` no longer resumes the timer while focus is inside the toast, and `focusout`
  no longer resumes it while the pointer is still over it (same for the end of a non-dismissing
  swipe).

### Low · `logical-properties` (cross-cutting, `Toaster:159-197`) — fixed

Position anchors use `inset-inline-start/end` (the `left`/`right` position names now mean the
inline start/end edge, so the stack mirrors under `dir="rtl"`; centred stacks stay physically
centred), `max-inline-size`, and the accent bar is `border-inline-start`. The fly-in direction
mirrors when the toaster's computed `direction` is `rtl`.

### Tests

- `test/unit/Toaster.svelte.test.ts`: persistent regions exist before any toast; polite/assertive
  routing via those regions (toasts carry no live role, are named groups); kind flip moves the
  announcement; focus moves to the neighbouring toast / returns to origin on dismiss;
  pointerleave doesn't resume while focused; focusout doesn't resume while hovered.
- `test/unit/vanilla-toaster.test.ts` (new): the same for the vanilla port, plus `prepare()`,
  reuse of authored regions, and the deferred first write.
- `test/unit/vanilla-toast.test.ts`: updated role expectations.
- **Lead follow-up (touch-targets):** the × dismiss button now has a 24×24 hit area (`min-inline-size`/`min-block-size: var(--ss-s-6)`, glyph centred). Test: source check.
