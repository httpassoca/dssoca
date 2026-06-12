---
id: DS-0078
type: story
title: "Component API consistency — naming conventions, disabled states, small a11y fixes"
status: done
priority: low
tags: [components, api, a11y]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a consumer, component APIs follow one convention. The scan found naming drift
(`title` vs `label`, ad-hoc `ariaLabel` props), missing disabled states on some
interactive components, and two small interaction nits.

## Acceptance criteria
- [x] Naming convention decided and written into DESIGN.md: when a component uses `title`
  vs `label`, and that `ariaLabel` (camelCase) is the standard prop for icon-only/landmark
  labels; existing components audited against it (Card/EmptyState `title`, Accordion
  `label`; BottomNav/LogStream `ariaLabel`, Topbar/EmptyState lacking one).
- [x] `disabled` support added where missing on Link (inert: no href, `role="link"` +
  `aria-disabled="true"`, `tabindex="-1"`, onclick swallowed) and component-wide on
  SegmentedControl (per-option exists; group gets `aria-disabled`, segments inert,
  no tab stop).
- [x] `disabled` on BottomNav items — implemented in the parallel DS-0068/69 workstream; verified at integration (native disabled button, aria-disabled, 4 tests incl. axe).
- [x] `Image.svelte` lightbox focus-trap selector (~L130-143) excludes disabled focusables
  (`:not([disabled]):not([aria-disabled="true"])`; also excludes `tabindex="-1"` elements
  such as the backdrop button).
- [x] `Menu.svelte` `onDocPointerDown` guards `panelEl` (covered by [[DS-0067-ssr-safety-pass]]
  if that lands first).
- [x] Any renames are backwards-compatible (alias + deprecation) or batched for a semver
  bump.
- [x] Tests extended for new disabled states; `pnpm test` green.
- [x] Documentation updated (docs.config.ts prop tables for every touched component).

## Notes
- Coordinate breaking renames with [[DS-0072-token-docs-sync]]'s `.hs-*` decision — one
  breaking release beats several.
- Implementation (2026-06-12): no renames were made — `Menu.label` / `SegmentedControl.label`
  are documented in DESIGN.md as grandfathered exceptions (any rename batched for a
  semver-major). New props, all backwards compatible: `Topbar.ariaLabel` (default
  `'Primary'` — previously hardcoded), `EmptyState.ariaLabel` (default unset),
  `Link.disabled` (default `false`), `SegmentedControl.disabled` (default `false`).
