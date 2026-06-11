---
id: DS-0078
type: story
title: "Component API consistency — naming conventions, disabled states, small a11y fixes"
status: todo
priority: low
tags: [components, api, a11y]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a consumer, component APIs follow one convention. The scan found naming drift
(`title` vs `label`, ad-hoc `ariaLabel` props), missing disabled states on some
interactive components, and two small interaction nits.

## Acceptance criteria
- [ ] Naming convention decided and written into DESIGN.md: when a component uses `title`
  vs `label`, and that `ariaLabel` (camelCase) is the standard prop for icon-only/landmark
  labels; existing components audited against it (Card/EmptyState `title`, Accordion
  `label`; BottomNav/LogStream `ariaLabel`, Topbar/EmptyState lacking one).
- [ ] `disabled` support added where missing on interactive components: Link,
  component-wide on SegmentedControl (per-option exists), BottomNav items — rendered
  inert and communicated to AT.
- [ ] `Image.svelte` lightbox focus-trap selector (~L130-143) excludes disabled focusables
  (`:not([disabled]):not([aria-disabled="true"])`).
- [ ] `Menu.svelte` `onDocPointerDown` guards `panelEl` (covered by [[DS-0067-ssr-safety-pass]]
  if that lands first).
- [ ] Any renames are backwards-compatible (alias + deprecation) or batched for a semver
  bump.
- [ ] Tests extended for new disabled states; `pnpm test` green.
- [ ] Documentation updated (docs.config.ts prop tables for every touched component).

## Notes
- Coordinate breaking renames with [[DS-0072-token-docs-sync]]'s `.hs-*` decision — one
  breaking release beats several.
