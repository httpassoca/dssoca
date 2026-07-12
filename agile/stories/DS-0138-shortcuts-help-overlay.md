---
id: DS-0138
type: story
title: "ShortcutsHelp — ? discovery overlay"
status: done
priority: high
tags: [ui, component, a11y, keyboard]
depends_on: [DS-0136, DS-0137]
parent: null
epic: DS-0135
created: 2026-07-12
updated: 2026-07-12
---

## Description

As a dssoca consumer, I want a drop-in "keyboard shortcuts" overlay (the GitHub/Slack/Linear `?`
dialog) that always shows the *live* registry state — groups, labels, effective bindings after
remaps, disabled state — so my users can discover shortcuts without me building a cheat sheet.

`src/lib/components/ShortcutsHelp.svelte` (`.ss-shortcuts-help`) — **composes `Modal`**
(cross-component imports are established: Button→Spinner, Menu→Icon), inheriting native
`<dialog>`/`showModal()` focus trap, Esc-close, backdrop, and focus return (SC 2.1.2/2.4.3 for
free). Renders `shortcuts.items` grouped: a `<section>` per group with an `<h3>` heading, rows as
`<dl>` — `<dt>` label / `<dd><Kbd keys={info.keys} /></dd>`; disabled shortcuts shown
struck-through with a muted "(off)" (visible SC 2.1.4 truth, not hidden). Empty registry renders
`EmptyState` instead of a blank dialog.

Props:

- `open?: boolean` — `$bindable`; controlled or self-managed.
- `title?: string` — default "Keyboard shortcuts".
- `hotkey?: string | null` — default **`'?, mod+/'`** (GitHub's `?` + Slack's `mod+/` fallback so
  discovery survives the `characterKeys` kill switch and SR browse mode). Self-registers
  **through the registry** (`id: 'ss:shortcuts-help'`, label "Show keyboard shortcuts", group
  "General") — it appears in its own list and is itself disable-able/remappable. `null` =
  register nothing (consumer wires their own trigger).
- `groupOrder?: string[]` — explicit section ordering; default insertion order, "General" last.
- `children?: Snippet` — extra content below the list.

Tokens: Modal chrome inherited; rows use `--ss-line` separators, `--ss-fg-muted`, `--ss-gap-sm`,
`--ss-size-sm`; group headings follow the existing panel-head convention. Docs must show a
**visible trigger** pattern (a button wired to `open`) — discovery can't be shortcut-only.

## Acceptance criteria

- [x] Component + barrel export; scoped SCSS, tokens above, radius 0.
- [x] Unit tests (`test/unit/ShortcutsHelp.svelte.test.ts` + harness): seeded registry renders
      groups/labels/Kbd values; remap updates the rendered binding reactively; disabled rows
      struck-through; `?` and `mod+/` keydown open it (`open` binds); `hotkey={null}` registers
      nothing; self-registration appears in `shortcuts.items` and unregisters on unmount;
      empty-registry EmptyState; dialog semantics per Modal's existing contract; axe clean on
      the open dialog.
- [x] Storybook `src/stories/ShortcutsHelp.stories.svelte` (seeded registry, open state, both
      themes).
- [x] Docs entry `documentation/src/lib/component-docs/shortcuts-help.ts` (notes: native-dialog
      semantics via Modal, registry-backed rows, visible-trigger guidance) + registration +
      nav-pin test update; `pnpm docs:test` green.
- [x] `pnpm test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green. Agile board rebuilt.
