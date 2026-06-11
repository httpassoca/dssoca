---
id: DS-0074
type: story
title: "Storybook controls completeness — expose every prop, a11y params, intro MDX"
status: todo
priority: low
tags: [storybook, dx]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a consumer exploring Storybook, I can exercise every prop via controls. Several
stories expose only a fraction of their component's API.

## Acceptance criteria
- [ ] Button story: add `size`, `loading`, `loadingLabel`, `fullWidth`, `iconOnly`,
  `leading`, `trailing` argTypes.
- [ ] Badge story: add `size`, `dot`, `count`, `max`, `live`, `label`, `ondismiss`.
- [ ] Input story: add `size`, `invalid`, `error`, `hint`, `clearable`, `prefix`,
  `suffix`, `readonly`.
- [ ] MetricTile story: add `prefix`, `trend`, `loading`, `chart`.
- [ ] Sidebar story: add `size`, `collapsed`, `onToggleCollapsed`.
- [ ] SegmentedControl story: add `value` + remaining props; Link story: add `size`.
- [ ] `size` argType added across the remaining stories that support it (BottomNav, Card,
  Topbar, Sparkline, Toaster, LogStream, Menu).
- [ ] An intro/overview MDX page (component index + axis explanation) added to
  `src/stories/`.
- [ ] Story-level `parameters.a11y` set where useful (form inputs, buttons).
- [ ] Stories stay in `src/stories/` (never `src/lib/`); Storybook builds clean.

## Notes
- Optional: shared `render: template` snippets for Menu/MetricTile/SegmentedControl/
  ServiceCard/Sparkline/LogStream stories to dedupe markup and make controls bind reliably.
