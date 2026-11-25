---
id: DS-0201
type: story
title: "Browser-pass fixes: Sidebar hidden groups, Modal backdrop focus, Topbar RTL arrows"
status: done
priority: high
tags: [a11y, sidebar, modal, topbar, rtl]
depends_on: []
parent: null
epic: null
created: 2026-11-25
updated: 2026-11-25
---

## Description

As a keyboard or screen-reader user, I want closed content to be really closed, focus to stay
somewhere useful after I dismiss a dialog, and arrow keys to move the way the page reads.

A browser pass found three defects that jsdom cannot see. All three predate the behaviour-core
work (`DS-0197`) and are fixed on `develop` as it stands.

- **Sidebar** (`DS-0202`): a closed disclosure group still rendered its children and kept them
  tabbable.
- **Modal** (`DS-0203`): a backdrop click left focus on `<body>`, on the Svelte and the
  plain-HTML path.
- **Topbar** (`DS-0204`): ArrowLeft / ArrowRight were not mirrored under `dir="rtl"`.

## Acceptance Criteria

- [x] A closed Sidebar group computes `display: none`; Tab from the parent skips its children and
      they are out of the accessibility tree.
- [x] After a Modal backdrop click, `document.activeElement` is the opener (component and
      `vanilla.js`); a drag from the panel to the backdrop does not close.
- [x] Under `dir="rtl"`, Topbar ArrowLeft moves to the DOM-next tab and ArrowRight to the
      DOM-previous one; Up/Down, Home/End unchanged.
- [x] Each fix has a test; Storybook has Sidebar stories with `children`.
- [x] Verified in headless Chromium in both themes and both directions.
- [x] Documentation updated (Sidebar, Modal and Topbar notes; `CHANGELOG.md` `[Unreleased]`).

## Notes

- Browser pass: `.claude/skills/verify` recipe against Storybook (Sidebar, Modal, Topbar) and the
  built `inspirations/board` page (vanilla Modal), dark/light × ltr/rtl.
- `feature/behavior-core` moves this logic into `src/lib/core/`. When it merges, the Modal
  backdrop rule and the Topbar RTL swap have to be carried into `core/modal.ts` /
  `core/topbar.ts` and their adapters.
- `SearchPalette` closes its backdrop on pointerdown the same way Modal did; not changed here.
