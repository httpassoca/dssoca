---
id: DS-0182
type: task
title: "Topbar: Front-End Checklist fixes"
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

Front-End Checklist findings for `Topbar` from issue #139.

### Medium · `keyboard-navigation`, `tabindex` — unreachable tab strip (fixed)

Confirmed: button tabs set `tabindex={current ? 0 : -1}`, so when `active` matched no tab id
(for example, the default `'overview'` with custom `tabs`), every button tab got `tabindex="-1"`
and Tab skipped the whole strip. A new `rovingIdx` derived now picks the active tab's index, and
falls back to the first button tab when no tab matches. Link tabs still have no tabindex, so they
stay in the natural tab order. The docs note on the component page now describes the fallback.

Tests (`test/unit/Topbar.svelte.test.ts`; both fail without the fix):

- `falls back to the first tab as the tab stop when active matches no tab (DS-0182)`
- `falls back to the first button tab when the leading tabs are links (DS-0182)`
- **Lead follow-up (RTL):** the remaining physical properties (`.skip` `left`/`top`, segment `border-left`/`border-right`, `.tab .n`/`.k` `margin-right`) are now logical (`inset-inline-start`, `border-inline-*`, `margin-inline-end`). Test: style-block check that no physical left/right property remains.
