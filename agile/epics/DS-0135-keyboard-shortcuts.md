---
id: DS-0135
type: epic
title: "Keyboard shortcuts — opt-in keyboard-friendly apps"
status: in-progress
priority: high
tags: [ui, epic, a11y, keyboard, api]
depends_on: []
parent: null
epic: null
created: 2026-07-12
updated: 2026-07-12
---

## Description

Ship an **opt-in keyboard-shortcut layer** so sites built with dssoca are keyboard-friendly with
minimal app code: a central runes registry + `{@attach}` sugar
([[DS-0136-shortcut-registry]]), a display-only `Kbd` key-cap chip
([[DS-0137-kbd-component]]), a `?`-style discovery overlay
([[DS-0138-shortcuts-help-overlay]]) that grows a built-in WCAG 2.1.4 remap/disable UI
([[DS-0141-editable-shortcuts-help]]), dogfooding of the two existing hand-rolled `mod+k`
listeners ([[DS-0139-dogfood-topbar-searchpalette]]), and a docs guide — *"Making your site
keyboard-friendly with dssoca"* ([[DS-0140-keyboard-guide-page]]).

Design pillars (researched against Primer/Polaris/Chakra/tinykeys/Mousetrap, WCAG 2.2 AA, and
Svelte 5 idiom; decisions locked with the owner):

- **Core** `src/lib/shortcuts.svelte.ts` follows the `toast.svelte.ts` house pattern: internal
  `ShortcutRegistry` class with `$state` fields, **only the `shortcuts` singleton + types
  exported** (a second instance would break the "exactly one shortcut fires" guarantee).
- **Grammar**: `+`-joined `mod|ctrl|alt|shift|meta` + one `event.key` (`mod+k`, `?`, `escape`);
  comma = alternative bindings; **space reserved** for future sequences (parse error in v1).
- **WCAG 2.1.4 in the box**: per-shortcut `setEnabled`/`remap`, a global `characterKeys` kill
  switch, serializable `ShortcutOverrides` (including the global toggles), and an `editable`
  ShortcutsHelp so consumers are compliant with zero custom code. `id` + `label` are required —
  every shortcut is listable, remappable, persistable.
- **Composition-safe matcher**: single lazy window listener (bubble phase); skips
  `defaultPrevented` (components win), `isComposing`, `repeat`, focused form fields, and
  suppresses global shortcuts while a modal `<dialog>` is open (SC 2.1.2). Focus-scoped beats
  global; last-registered wins within a tier.
- **SSR-safe**: `add()` is a full no-op without `window` (no cross-request singleton leak);
  registration lives in effects/attachments.
- **Svelte peer bump `^5.0.0` → `^5.29`** for the attachment API (CHANGELOG-flagged).
- **`mod+k` narrowing**: Topbar/SearchPalette currently fire on *either* Cmd or Ctrl on every
  platform; re-registering as `mod+k` narrows to the platform modifier (CHANGELOG-flagged
  behavior change; `aria-keyshortcuts` becomes accurate).

**Out of scope** (deliberate): command-palette behavior (SearchPalette exists — this epic only
owns its *binding*); key sequences (`g i` — grammar reserves space, NVDA/JAWS browse mode swallows
printable keys); roving-tabindex extraction (five components hand-roll it correctly already);
pressed-key state (runed covers it); override persistence (guide ships a localStorage recipe;
storage is app policy); a SkipLink component (Topbar ships one; guide documents the pattern);
`accesskey` (MDN recommends `aria-keyshortcuts` instead).

## Acceptance criteria

- [x] All child stories (DS-0136 … DS-0141) are done.
- [x] `pnpm test`, `pnpm docs:test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green.
- [x] CHANGELOG carries the peer-dep bump (`svelte@^5.29`) and the Topbar/SearchPalette `mod+k`
      platform-narrowing note with migration guidance.
- [ ] Hand audit: shortcuts fire/skip per the matcher rules in showcase + Storybook, both themes,
      all three sizes; ShortcutsHelp lists every registered shortcut including its own trigger.
