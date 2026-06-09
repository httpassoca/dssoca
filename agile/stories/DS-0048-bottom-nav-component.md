---
id: DS-0048
type: story
title: "BottomNav component"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: null
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want a **BottomNav** (mobile tab bar) — a fixed bottom row of icon+label tabs
with an active highlight — so app shells get a first-class mobile navigation surface to complement the
existing `Topbar`/`Sidebar`. The website's `MobileBottomNav.svelte` is the reference: a fixed grid of
icon+label items, semi-transparent blurred background, active-state highlight, and safe-area inset support
for notched devices.

## Acceptance criteria
- [ ] `BottomNav` gains the behaviour tracked in [[ds-0054-bottom-nav-implementation]] (the per-component task)
- [ ] Changes are additive — new file + barrel export; no existing component touched
- [ ] New chrome reads `--ss-*` size tokens (and the shell height tokens) and respects zero border-radius
- [ ] WCAG 2.2 AA upheld (`aria-current`, hit-target sizing); `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0043-new-components-from-website]].
- Concrete work is the single task [[ds-0054-bottom-nav-implementation]]; the detailed checklist lives there.
- Source: `passoca/src/lib/components/MobileBottomNav.svelte`.
