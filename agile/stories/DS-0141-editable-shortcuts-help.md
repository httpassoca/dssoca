---
id: DS-0141
type: story
title: "Editable ShortcutsHelp — built-in WCAG 2.1.4 remap/disable UI"
status: done
priority: high
tags: [ui, component, a11y, keyboard]
depends_on: [DS-0138]
parent: null
epic: DS-0135
created: 2026-07-12
updated: 2026-07-12
---

## Description

As a dssoca consumer, I want the shortcuts overlay to double as the user-facing remap/disable
surface, so my app satisfies WCAG 2.1.4 (turn off / remap) with zero custom settings code —
mounting `<ShortcutsHelp editable />` is the whole compliance story.

Extends [[DS-0138-shortcuts-help-overlay]] with an `editable?: boolean` prop (default `false`):

- Per-row enable toggle — the existing `Switch` component wired to
  `shortcuts.setEnabled(id, …)`; disabled rows keep the struck-through "(off)" presentation.
- Per-row **remap**: a "change" affordance that records the next keydown as the new binding
  (Esc cancels, validated through the DS-0136 parser — sequences/reserved combos rejected with
  inline feedback), wired to `shortcuts.remap(id, keys)`; per-row reset to default
  (`remap(id, null)`).
- Global section: the `characterKeys` kill switch (Switch) and a "Restore defaults" button →
  `shortcuts.resetOverrides()`.
- Recording UI must itself be keyboard-operable and announced (live region for "Press the new
  shortcut…" / result), and must not trigger other shortcuts while recording (registry
  suppressed during capture).
- Persistence stays app-side: the docs show `getOverrides()` → localStorage on change,
  `applyOverrides()` at startup (recipe from the guide, [[DS-0140-keyboard-guide-page]] §4).

## Acceptance criteria

- [x] `editable` prop renders per-row Switch + remap + reset, global `characterKeys` Switch, and
      restore-defaults; non-editable rendering unchanged.
- [x] Unit tests: Switch toggles call `setEnabled`; recording captures a combo, validates via
      the parser, rejects invalid/reserved input with feedback, Esc cancels; other shortcuts
      suppressed while recording; reset/restore call `remap(id,null)`/`resetOverrides`; rows
      re-render live; axe clean in editable mode.
- [x] Storybook story for the editable state.
- [x] `shortcuts-help.ts` docs entry + guide §4 updated ("compliance out of the box" path);
      `pnpm docs:test` green.
- [x] `pnpm test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green. Agile board rebuilt.
