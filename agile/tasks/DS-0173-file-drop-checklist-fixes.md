---
id: DS-0173
type: task
title: "FileDrop: Front-End Checklist fixes"
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

Fixes the FileDrop findings from the Front-End Checklist audit (GitHub issue #139).
FileDrop has no cross-cutting findings and no vanilla behaviour.

- **Medium · `focus-management`**: activating Remove / Clear unmounted the focused button and
  focus fell to `<body>`. `removeAt` now waits for `tick()` and focuses the remove button now at
  the same index (the next file), else the previous one, else the zone. `clear` focuses the zone.
- **Medium · `label-content-name-mismatch`**: the zone's `aria-label` replaced its visible
  "Drop files here" text. The zone is now named with `aria-labelledby="{labelId} {titleId}"`
  (just `{titleId}` when there's no label), so the name contains the visible text.
- **Medium · `touch-targets`**: `.remove` and `.clear` now have `min-inline-size` /
  `min-block-size: 24px` (the WCAG 2.5.8 floor), with the glyph centred via inline-flex. `.clear`
  also gets `--ss-s-1` inline padding.
- **Low · `aria-labels`**: the hint was in both the name and `aria-describedby`. Because the name
  now comes from `aria-labelledby`, the hint appears only in the description.
- **Low · `file-upload-accessibility`**: files dropped by `accept` / `!multiple` were discarded
  silently. Added a new `onreject?: (files: File[]) => void` prop and an always-mounted visually
  hidden polite live region (`role="status"`) that announces
  "Not added: x.txt (file type not accepted), b.txt (only one file allowed)."

Tests (`test/unit/FileDrop.svelte.test.ts`): accessible name from aria-labelledby (with and
without a label), hint only in the description, onreject plus the live-region text for accept
and multiple rejections, no onreject on a clean drop, focus after removing the middle, last and
only file and after Clear, and a source contract for the 24px minimum hit area.

Docs (`component-docs/file-drop.ts`) and the story's argTypes were updated.
