---
id: DS-0161
type: story
title: "Front-End Checklist audit fixes across components (#139)"
status: done
priority: high
tags: [a11y, components, rtl, focus]
depends_on: []
parent: null
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

As a dssoca consumer, I want every component to pass the Front-End Checklist
(<https://frontendchecklist.io>) rules it is responsible for, so the apps I build on dssoca meet
WCAG 2.2 AA without patching the library. A full audit of all 42 components
([GitHub #139](https://github.com/httpassoca/dssoca/issues/139)) found 58 items: 5 high, 29 medium
and 24 low, in 30 components. They include low-contrast focus rings, collapsed Accordion content
that can still be reached with Tab, tooltips screen readers never read, unreadable Heatmap values,
and chart marks exposed as buttons that do nothing when activated, plus RTL and focus-loss
problems.

There is one task per affected component (`DS-0162` … `DS-0193`). The chart components share one
keyboard contract through `src/lib/chart-nav.ts`.

## Acceptance criteria

- [x] Every checklist item in #139 is fixed, or explicitly deferred with a reason in its task
- [x] Tests added or extended for each fix; `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm format:check` green
- [x] Vanilla parity kept (`src/lib/vanilla/` behaviours and the generated `vanilla.css` contract)
- [x] Interactive fixes verified in a real browser (jsdom can't see focus, visibility or contrast)
- [x] Documentation updated (component-docs pages for any API or behaviour change)

## Notes

- Deferred: Chart grouped bars remain colour + position encoded (see DS-0184). Field wrappers keep
  their `--ss-primary-soft` focus *halo*; it is decorative on top of the solid `--ss-primary` border.
- Verified in headless Chromium against Storybook (30 checks: focus-ring contrast, RTL thumb/arrows,
  Accordion tab order, Tooltip description/hover/Escape, chart single tab stop, Modal scroll lock,
  NumberField focus at bounds, SearchPalette mobile close, LogStream chip contrast, Card/ServiceCard
  overlays).

- Audit source: `frontend-checklist-global` skill + rule corpus `packages/content/rules/en/` in
  thedaviddias/Front-End-Checklist.
- Branch: `feature/frontend-checklist-fixes` → PR into `develop`.
