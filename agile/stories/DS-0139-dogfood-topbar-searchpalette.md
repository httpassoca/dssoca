---
id: DS-0139
type: story
title: "Dogfood: Topbar + SearchPalette mod+k on the registry"
status: done
priority: high
tags: [ui, refactor, a11y, keyboard]
depends_on: [DS-0136, DS-0137]
parent: null
epic: DS-0135
created: 2026-07-12
updated: 2026-07-12
---

## Description

As a dssoca consumer, I want the library's own global shortcuts to go through the shortcut
registry, so they appear in `ShortcutsHelp`, respect the global/`characterKeys` switches, are
remappable (closing their current WCAG 2.1.4 gap), and can't silently collide with my own
`mod+k` registrations.

Two hand-rolled window listeners exist today, and both fire on **either** Cmd or Ctrl on every
platform:

- **Topbar** (`src/lib/components/Topbar.svelte` — the DS-0081 `$effect`): re-register via the
  registry inside the same effect, `id: 'ss:topbar-command'`, `keys: 'mod+k'`, label "Open
  command menu", still gated on `onCommand` being set (thunk returns nothing otherwise). The
  hardcoded `aria-keyshortcuts="Meta+K Control+K"` and the ⌘K chip derive from
  `ariaKeyshortcuts('mod+k')` + `<Kbd keys="mod+k" />`.
- **SearchPalette** (`src/lib/components/SearchPalette.svelte` — `onWindowKeydown`): re-register
  via the registry, `id: 'ss:search-palette'`, label "Open search". The public prop
  `shortcut?: 'mod+k' | false` is **unchanged** (`false` = don't register).

**Deliberate behavior change (owner-approved, CHANGELOG-flagged)**: `mod+k` narrows to the
platform modifier — Ctrl+K stops working on macOS (Cmd+K remains), matching Slack/Linear/GitHub
convention and making `aria-keyshortcuts` truthful. When both components are mounted with the
default binding, the registry's deterministic conflict policy applies (last-registered wins +
dev warn); the docs note tells consumers to pick one (e.g. `shortcut={false}` on one of them).

## Acceptance criteria

- [x] Neither component owns a raw `window.addEventListener('keydown', …)` for its global
      shortcut anymore; both register through `shortcuts` with the `ss:*` ids above; public
      component APIs unchanged.
- [x] Both appear in `ShortcutsHelp`, obey `enabled`/`setEnabled`/`remap`, and unregister when
      unmounted / `onCommand` unset / `shortcut={false}`.
- [x] Topbar's `aria-keyshortcuts` and ⌘K chip derive from `ariaKeyshortcuts()` / `<Kbd>`; value
      reflects the platform (`Meta+K` on Apple, `Control+K` elsewhere).
- [x] Existing Topbar/SearchPalette test suites updated: registration is conditional, fires
      `onCommand`/toggles the palette, platform narrowing asserted both ways (mocked), remap
      reroutes the trigger.
- [x] CHANGELOG: behavior-change entry with migration note (`remap('ss:topbar-command',
      'ctrl+k')`-style recipe for either-modifier die-hards).
- [x] `topbar.ts` / `search-palette.ts` docs notes updated (registry-backed, listed in
      ShortcutsHelp, collision guidance); `pnpm docs:test` green.
- [x] `pnpm test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green. Agile board rebuilt.
