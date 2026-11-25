---
id: DS-0205
type: task
title: "SearchPalette: a backdrop click keeps focus on the opener"
status: done
priority: high
tags: [a11y, search-palette, focus]
depends_on: []
parent: null
epic: null
created: 2026-11-25
updated: 2026-11-25
---

## Description

Same defect as Modal (`DS-0203`), confirmed in headless Chromium on the docs site's own palette:
open it from the focused "Open command menu" button, click the backdrop, and
`document.activeElement` is `<body>`. The dialog closed on the backdrop `pointerdown`, the
browser returned focus to the opener, then the same gesture's `mousedown` landed on the page and
blurred it. Esc was not affected.

`SearchPalette.svelte` now remembers whether the press started on the backdrop and closes on the
`click` that follows. A drag from inside the panel to the backdrop still does not close (the
click targets the dialog, but the press did not start there). There is no plain-HTML
(`vanilla.js`) palette, so nothing to mirror.

- Tests: `test/unit/SearchPalette.svelte.test.ts` (stays open on the pointerdown, closes on the
  click, press on the panel, drag case).
- Docs: the component notes describe the backdrop click.
- Browser pass: dark and light, `dir="ltr"` and `dir="rtl"`; focus ends on the opener in all
  four.
