---
id: DS-0180
type: task
title: "SearchPalette: Front-End Checklist fixes"
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

Front-End Checklist findings for `SearchPalette` from issue #139.

- **Medium · `modal-accessibility`, `touch-targets` (no close control in the full-screen
  small-viewport layout)**: fixed. The input now sits in a `.bar` flex row with a `button.close`
  (×, `aria-label={closeLabel}`, new prop with the default `'Close'`), and the hit area is
  `min-inline-size`/`min-block-size: var(--ss-s-10)` (40px). It is `display: none` by default and
  `inline-flex` inside the `max-width: 767px` media query. The focus underline moved from
  `.input:focus` to `.bar:focus-within`.
- **Low · `aria-live-regions` (no-results/count not announced)**: fixed. A visually hidden
  `<p class="sr-only" role="status">` is always rendered. It stays empty until a query is typed,
  then shows `resultsText(n)` (new prop, default `n result(s)`) or `emptyText`.
- **Low · `modal-accessibility` (background scroll)**: fixed. An effect sets
  `document.documentElement.style.overflow = 'hidden'` while open and restores the previous inline
  value on close or unmount. `.results` already had `overscroll-behavior: contain`.
- **Low · `logical-properties` (cross-cutting, `:479-484`)**: fixed. `.row` uses
  `border-inline-start`, `padding-inline-start` and `text-align: start`, and `.active` uses
  `border-inline-start-color`.

Tests (`test/unit/SearchPalette.svelte.test.ts`, "Front-End Checklist fixes (DS-0180)"): close
button presence/name/closes, `closeLabel`, persistent status node with count, no-results text and
`resultsText`, scroll lock applied and restored, and no lock while closed.
- **Lead follow-up:** the scroll lock now uses the shared, reference-counted `lockScroll`/`unlockScroll` from `vanilla/modal.ts` (also exported from `dssoca/vanilla.js`), so a palette over a Modal (or vice versa) unwinds correctly.
