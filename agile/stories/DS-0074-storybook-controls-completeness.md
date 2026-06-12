---
id: DS-0074
type: story
title: "Storybook controls completeness — expose every prop, a11y params, intro MDX"
status: done
priority: low
tags: [storybook, dx]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a consumer exploring Storybook, I can exercise every prop via controls. Several
stories expose only a fraction of their component's API.

## Acceptance criteria
- [x] Button story: add `size`, `loading`, `loadingLabel`, `fullWidth`, `iconOnly`,
  `leading`, `trailing` argTypes.
- [x] Badge story: add `size`, `dot`, `count`, `max`, `live`, `label`, `ondismiss`.
- [x] Input story: add `size`, `invalid`, `error`, `hint`, `clearable`, `prefix`,
  `suffix`, `readonly`.
- [x] MetricTile story: add `prefix`, `trend`, `loading`, `chart`.
- [x] Sidebar story: add `size`, `collapsed`, `onToggleCollapsed`.
- [x] SegmentedControl story: add `value` + remaining props; Link story: add `size`.
- [x] `size` argType added across the remaining stories that support it (BottomNav, Card,
  Topbar, Sparkline, Toaster, LogStream, Menu) — plus Heading, Container, Textarea
  (Spinner already had it).
- [x] An intro/overview MDX page (component index + axis explanation) added to
  `src/stories/` (`Introduction.mdx`). No `.storybook/main.ts` change needed — its
  `stories` glob already includes `../src/**/*.mdx`.
- [x] Story-level `parameters.a11y` set where useful (form inputs, buttons):
  `a11y: { test: 'error' }` on Button, Badge, Input, Textarea, SegmentedControl, Link.
- [x] Stories stay in `src/stories/` (never `src/lib/`); Storybook builds clean
  (`pnpm build-storybook` green, 188 index entries incl. `introduction--docs`).

## Notes
- Optional: shared `render: template` snippets for Menu/MetricTile/SegmentedControl/
  ServiceCard/Sparkline/LogStream stories to dedupe markup and make controls bind reliably.
  → Done for Menu (replaced six per-story templates with one shared snippet), MetricTile
  (needed for the `chart` snippet slot), and SegmentedControl. Sparkline/LogStream/
  ServiceCard pass plain args and bind fine without one.
- Snippet-valued props are toggled via story-only booleans (`withLeading`, `withTrailing`,
  `withPrefix`, `withSuffix`, `withChart`, `dismissible`) that conditionally pass demo
  snippets.
- Defensive wiring for in-flight APIs (props pass through templates; Svelte ignores them
  until the prop lands): Link `disabled`, SegmentedControl component-wide `disabled`,
  BottomNav per-item `disabled`, Topbar `ariaLabel`, EmptyState `ariaLabel`. Topbar
  object `tabs` / `services` / `clock` argTypes were already covered.
