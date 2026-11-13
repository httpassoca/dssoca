---
id: DS-0175
type: task
title: "Badge: Front-End Checklist fixes"
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

Front-End Checklist audit findings for `Badge` (issue #139).

- **Medium · `aria-labels`** (`Badge.svelte:54,58`): a children-less badge got `role="img"`
  even without `label`, so a count-only badge became an unnamed image and its visible count was
  hidden from AT. **Fixed:** the accessible name now falls back to the (clamped) count text when
  `label` is missing, and `role="img"` is set only when the badge actually has a name. A
  dot-only badge with no `label` stays a plain span. `live` still yields `role="status"`.
  - Tests (`test/unit/Badge.svelte.test.ts`): count fallback name (`7`), clamped fallback
    (`99+`), no role/aria-label for an unnamed dot-only badge, axe on an unlabelled count-only
    badge.
- No Badge items in the Cross-cutting section.

Docs: `label` prop description in `documentation/src/lib/component-docs/badge.ts` updated.
- **Lead follow-up:** the docs usage example and the `CountOnly` story now put the count in `label` (`"42 unread"`), since `label` replaces the count in the accessible name.
