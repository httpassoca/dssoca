---
id: DS-0202
type: task
title: "Sidebar: a closed disclosure group is really hidden"
status: done
priority: high
tags: [a11y, sidebar]
depends_on: []
parent: DS-0201
epic: null
created: 2026-11-25
updated: 2026-11-25
---

## Description

`.sublist { display: flex }` in `Sidebar.svelte` outranked the UA rule for the `hidden`
attribute, so `<ul class="sublist" hidden>` still rendered (about 69px tall) and its children
stayed in the tab order. Added `.sublist[hidden] { display: none }`.

- Test: `test/unit/Sidebar.svelte.test.ts` pins the rule at source (jsdom applies no scoped
  styles).
- Stories: "Nested (closed)" and "Nested (active child)" in `src/stories/Sidebar.stories.svelte`;
  no story had `children`, which is why this went unseen.
