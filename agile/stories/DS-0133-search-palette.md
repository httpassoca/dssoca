---
id: DS-0133
type: story
title: "SearchPalette — Cmd/Ctrl+K search & command palette"
status: done
priority: high
tags: [component, overlay, a11y, keyboard]
depends_on: []
parent: null
epic: null
created: 2026-07-12
updated: 2026-07-12
---

## Description

As an app using dssoca, I want a Cmd/Ctrl+K search palette component (modal combobox over a
grouped listbox) so I can offer keyboard-first navigation/search without rebuilding the overlay,
keyboard model and a11y wiring in every app.

Generalizes passoca's `SearchPalette.svelte` (commit `fdc1d75`): same visual spec (centered panel
at 15vh, `min(40rem, 100vw − s-8)`, mono font, borderless input with `--ss-primary` focus
underline, `--ss-primary-soft` + 2px left-rail active option, uppercase group labels, footer hint,
full-screen `100dvh` mobile) — but prop-driven: no search engine, no i18n, no router, no store.

**Architecture decisions (refined via research on cmdk/shadcn Command, Primer/VS Code palettes,
the ARIA APG combobox pattern, and the repo's Modal/Select/Menu precedents):**

- **Native `<dialog>` + `showModal()`** mirroring `Modal.svelte` (DS-0094): free focus trap,
  Esc → `cancel`, `::backdrop`, top layer, focus restore. `open` is `$bindable`; backdrop close =
  pointerdown on the dialog element itself.
- **Generic component** — `generics="T extends SearchPaletteItem"`; base item
  `{ id, label, hint?, href?, group?, keywords?, disabled? }`; `T` flows through snippets and
  `onselect`.
- **Filtering, both modes** — default internal case/diacritic-insensitive substring match over
  `label` + `keywords` (empty query ⇒ all items, passoca's quick-jumps); `filter={false}`
  disables it so the consumer binds `query` and supplies pre-filtered `items` (async search).
  No fuzzy scoring in v1.
- **Groups** derived from `item.group` in first-appearance order, ungrouped items first
  (unlabeled); flat selection index across groups (keyboard order = DOM order).
- **Selection (APG combobox)** — focus stays on the input; `aria-activedescendant` points at the
  active option; ArrowUp/Down wrap; PageUp/PageDown jump to first/last (Home/End stay native so
  caret editing in the textbox keeps working, per APG); option rows swallow `pointerdown` so a
  click never moves focus off the input; Enter selects (`onselect(item)`, and items
  with `href` render real `<a>`s whose click carries native routing semantics); closes after
  select unless `onselect` returns `false`; Tab swallowed while open; disabled items skipped;
  mousemove tracks hover; `scrollIntoView({ block: 'nearest' })`; selection resets on query
  change; `e.isComposing` guarded everywhere.
- **Global shortcut** — `shortcut?: 'mod+k' | false` (default `'mod+k'`) via
  `<svelte:window onkeydown>` (SSR-safe). Ctrl+K and Cmd+K toggle.
- **Footer** — `footerText?: string | false` defaulting to the key legend
  (`'↑↓ navigate · ↵ open · esc close'`); `false` hides it; a `footer` snippet replaces it.
- **Custom rendering** — `item` snippet `Snippet<[T, { active: boolean }]>` replaces the default
  row (label + muted `hint` line); `empty` snippet (default: `emptyText`).
- **Metrics** as inline `var(--ss-search-palette-*, fallback)` (DS-0094 pattern — no global
  SCSS); size axis via `resolveComponentSize('SearchPalette', size)` → panel max-width/paddings.

## Acceptance criteria

### Component (`src/lib/components/SearchPalette.svelte`)

- [x] Root `.ss-search-palette` on a native `<dialog>`; internals use plain unprefixed class
      names. Zero border-radius. No raw color literals (slot tokens / `color-mix()` only;
      backdrop follows Modal's `var(--ss-*-backdrop, …)` pattern).
- [x] `open` is `$bindable(false)`; opening calls `showModal()` and focuses the input; closing
      fires `onclose`, restores focus natively, and (with `resetOnClose`, default true) clears
      `query` + selection.
- [x] Keyboard: ArrowUp/Down wrap across the flat filtered list; PageUp/PageDown jump to
      first/last (Home/End left native for caret editing); Enter fires
      `onselect` (clicks the option's `<a>` when `href` present) then closes unless `onselect`
      returns `false`; Esc closes (native cancel); Tab swallowed while open; disabled skipped;
      `e.isComposing` guarded.
- [x] ARIA (APG combobox): input `role="combobox"` + `aria-expanded` + `aria-controls` +
      `aria-activedescendant` (ids from `$props.id()`); `role="listbox"` list, `role="option"`
      entries with `aria-selected`; labelled groups use `role="group"` + `aria-label`; dialog
      carries the `aria-label` prop (default `'Search'`).
- [x] Filtering per the architecture above; selection index stays valid when `items`/`query`
      change.
- [x] `shortcut` prop: `'mod+k'` toggles on Ctrl/Cmd+K (default), `false` disables.
- [x] Visuals per the reference spec; results `max-height: 60vh; overscroll-behavior: contain`;
      mobile ≤ 767px full-screen `100dvh`; size axis sm/md/lg maps to panel width/paddings.

### Library plumbing

- [x] `'SearchPalette'` added to the manifest component list in `src/lib/dssoca.config.ts`.
- [x] Barrel export in `src/lib/index.ts` (component + `SearchPaletteItem` type).

### Tests (`test/unit/SearchPalette.svelte.test.ts`)

- [x] Mirrors Modal's suite (dialog polyfill, testing-library, vitest-axe): open/close sync,
      backdrop, `onopen`/`onclose`, `resetOnClose`.
- [x] Keyboard: wrap, PageUp/PageDown, Enter payload + return-`false` keeps open, Tab swallowed,
      disabled skipped, `href` items render `<a>`.
- [x] Filter: label + keyword + diacritic-fold hits, empty query = all, `filter={false}`
      passthrough, selection reset on query change.
- [x] Groups: first-appearance order, ungrouped first, continuous flat index.
- [x] Shortcut: mod+k toggles; `shortcut={false}` inert.
- [x] Snippets: custom `item`/`empty`/`footer`; `footerText={false}` hides the footer.
- [x] `vitest-axe` clean on the open palette.

### Docs & stories (RULES)

- [x] `documentation/src/lib/component-docs/search-palette.ts` + registration in
      `component-docs/index.ts`; added to the `navigation` category in `categories.ts`.
- [x] All-components page preview (static stand-in — a live top-layer `<dialog>` would escape
      the inert card, same reasoning as the Modal/Toaster previews).
- [x] `src/stories/SearchPalette.stories.svelte` (Svelte CSF): Default (grouped), custom item
      snippet, external filter, no footer.
- [x] `docs/tokens.md`: document the `--ss-search-palette-*` metric vars.
- [x] `pnpm test`, `pnpm docs:test`, `pnpm lint`, `pnpm check`, `pnpm build-storybook` green.

## Notes

- Enter-on-href clicks the real anchor (passoca trick) so router interception, `target` and
  modifier keys behave natively — never synthesize navigation.
- `aria-activedescendant` + focus-stays-on-input is the APG pattern passoca already ships;
  do not move DOM focus into the listbox.
- Multiple palettes: last-mounted wins the shortcut; acceptable v1, documented.
- Out of scope v1: fuzzy scoring, recents/frequency, multi-select, cmdk-style nested pages,
  `>` command-mode prefix.
