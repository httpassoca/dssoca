---
id: DS-0203
type: task
title: "Modal: a backdrop click keeps focus on the opener"
status: done
priority: high
tags: [a11y, modal, vanilla, focus]
depends_on: []
parent: DS-0201
epic: null
created: 2026-11-25
updated: 2026-11-25
---

## Description

The dialog closed on the backdrop `pointerdown`. The browser returned focus to the opener, then
the same gesture's `mousedown` landed on the page and blurred it, so focus ended on `<body>`.

`Modal.svelte` and `vanilla/modal.ts` now remember whether the press started on the backdrop and
close on the `click` that follows. A drag from inside the panel to the backdrop still does not
close (the click targets the dialog, but the press did not start there).

- Tests: `Modal.svelte.test.ts`, `vanilla-modal.test.ts`, `vanilla-behaviors.test.ts` (stays open
  on the pointerdown, closes on the click, drag case, `closeOnBackdrop=false` / `data-ss-static`).
