---
id: DS-0137
type: story
title: "Kbd — display-only key-cap chip"
status: backlog
priority: high
tags: [ui, component, a11y, keyboard]
depends_on: [DS-0136]
parent: null
epic: DS-0135
created: 2026-07-12
updated: 2026-07-12
---

## Description

As a dssoca consumer, I want a `<Kbd>` chip that renders a key combo in house style (correct
per-platform glyphs, mono font, zero radius) so shortcut hints in buttons, menus, and tooltips
look consistent and read correctly in assistive tech.

`src/lib/components/Kbd.svelte` — **display-only** (registers nothing; Primer KeybindingHint /
Polaris KeyboardKey stance). MDN nested-`<kbd>` markup: outer `<kbd class="ss-kbd">`, one inner
`<kbd class="key">` per key, `.sep` spans (`+`, aria-hidden) between, comma-alternatives as
sibling groups joined by a muted "or".

Props:

- `keys?: string` — combo grammar from [[DS-0136-shortcut-registry]], rendered via
  `formatShortcut` (`mod` resolves per platform).
- `format?: 'glyph' | 'label'` — default **`glyph`** (⌘⇧⌃⌥⏎ arrows on Apple; words elsewhere);
  `label` always words. Glyph roots carry a full-word `aria-label` ("Command K") — ⌘ reads
  poorly in AT.
- `platform?: 'apple' | 'other'` — override auto-detect. Default: `'other'` on the server *and*
  first client render, corrected in an effect (no hydration mismatch); SSR apps can pass it
  explicitly for a stable first paint.
- `size?: Size` via `resolveComponentSize('Kbd', size)` (add `'Kbd'` to `COMPONENT_NAMES` in
  `dssoca.config.ts`).
- `children?: Snippet` — raw-content escape hatch (`<Kbd>F12</Kbd>`).

**Zero new tokens**: `--ss-badge-neutral-{bg,border,fg}` (existing chip recipe — already
slot-based `color-mix()` washes), `--ss-badge-px/py/gap` (rescales with `data-size-variant`),
`--ss-font-mono`, `--ss-size-xs`, `border-bottom-color: var(--ss-line-strong)` for key-cap depth
(zero border-radius, no shadow gimmicks), `--ss-fg-muted` separators.

## Acceptance criteria

- [ ] Component + barrel export (`Kbd`); `'Kbd'` in `COMPONENT_NAMES`; scoped SCSS only, tokens
      above, no raw color literals, radius 0.
- [ ] Unit tests (`test/unit/Kbd.svelte.test.ts`): nested-`<kbd>` structure, glyph vs label
      output with `platform` mocked both ways, full-word `aria-label` in glyph format,
      comma-alternative rendering, children escape hatch, size attribute; axe clean (added to
      the a11y coverage suite).
- [ ] Storybook `src/stories/Kbd.stories.svelte`: glyph/label, both platforms (via the
      `platform` prop), sizes, both themes.
- [ ] Docs entry `documentation/src/lib/component-docs/kbd.ts` (props/usage/description/notes —
      notes: purely visual, never show a key without explanatory text, pair the real binding
      with `ariaKeyshortcuts()` on the owning control) + `index.ts`/`categories.ts` registration
      + pinned nav-array test update; `pnpm docs:test` green.
- [ ] `pnpm test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green. Agile board rebuilt.
