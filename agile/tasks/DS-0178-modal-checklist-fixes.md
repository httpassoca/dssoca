---
id: DS-0178
type: task
title: "Modal: Front-End Checklist fixes"
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

Front-End Checklist findings for Modal (issue #139).

- **Low · `aria-dialog-name`** (custom `header` dropped `aria-labelledby`): fixed. The `header`
  snippet is now `Snippet<[titleId: string]>` and receives the id the dialog's `aria-labelledby`
  points at. With a custom header the dialog stays `aria-labelledby={titleId}` (unless only an
  `aria-label` is given), and `title` / `aria-label` are kept as an `aria-label` fallback, which
  name computation uses when the snippet never renders that id. A dev `console.warn` fires when a
  custom header leaves the dialog unnamed. Also fixes the latent case of `title` + `header`, where
  `aria-labelledby` pointed at an `<h2>` that was never rendered.
- **Low · `modal-accessibility`** (page behind scrolls): fixed. While open, `<html>` gets
  `overflow: hidden` through a ref-counted `lockScroll()` / `unlockScroll()` pair in
  `src/lib/vanilla/modal.ts` (count stored on `<html data-ss-scroll-lock>`, so stacked dialogs and
  separate bundles share it). `.body` gets `overscroll-behavior: contain`. Vanilla parity:
  `openModal` locks; `closeModal`, backdrop pointerdown and native `close` (Escape,
  `form method="dialog"`) release exactly once per dialog.
- Drive-by: close button `margin-left: auto` → `margin-inline-start: auto` (RTL).

Tests: `test/unit/Modal.svelte.test.ts` ("custom header naming", "scroll lock" suites) and new
`test/unit/vanilla-modal.test.ts`. Story `CustomHeader` added.
