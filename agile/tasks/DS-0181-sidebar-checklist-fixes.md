---
id: DS-0181
type: task
title: "Sidebar: Front-End Checklist fixes"
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

Fix the Sidebar findings from the Front-End Checklist audit (GitHub issue #139). The issue's
line numbers (523-794) don't match the 505-line source, but every finding was confirmed in the
code.

- **Medium · `sensory-instructions`**: fixed. Degraded/down status in the expanded rail was only an
  `aria-hidden` coloured dot. A `statusDot` snippet now renders the dot plus a visually hidden
  `, degraded` / `, down` word for every item kind (button, link, disclosure, child). `up` adds no
  word. The collapsed rail keeps folding the word into the `aria-label`.
- **Medium · `duplicate-id-aria` / `unique-id`**: fixed. `ss-side-sec-${gi}` and
  `ss-side-sub-${item.id}` are now `${$props.id()}-sec-${gi}` and `${$props.id()}-sub-${item.id}`.
- **Low · `button-name`**: fixed. The rail toggle has the static name "Sidebar" and uses
  `aria-expanded={!collapsed}` instead of `aria-pressed` with a changing label.
- **Low · `logical-properties` (cross-cutting)**: fixed. `border-right`, `border-left`,
  `margin-left`, `padding-left` and `text-align: left` became their inline/logical forms. The
  disclosure caret (drawn with `border-inline-start`) rotates `-90deg` under `:dir(rtl)` so the
  open state still points down.

Tests (`test/unit/Sidebar.svelte.test.ts`): the toggle test now checks `aria-expanded`, plus a
static-name/no-`aria-pressed` test, a status-word test that covers all item kinds, a two-instance
unique-id test that also checks references resolve, and a source guard for no physical
left/right properties.
