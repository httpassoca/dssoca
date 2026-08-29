---
id: DS-0147
type: story
title: "Docs site — keyboard-friendly shell: SearchPalette + ShortcutsHelp + global shortcuts"
status: done
priority: low
tags: [docs, keyboard, a11y, search]
depends_on: []
parent: null
epic: null
created: 2026-08-29
updated: 2026-08-29
---

## Description

As a visitor of the dssoca docs, I want to search the site and drive it from the keyboard —
and as the maintainer I want the site to **dogfood the library's own keyboard layer** instead
of describing it. Before this story the docs app had zero keyboard handling: a hand-rolled
`<header class="topbar">`, no search, and none of `Topbar` / `SearchPalette` / `ShortcutsHelp` /
`Kbd` / the `shortcuts` registry in use — while `/keyboard` documented all of them.

**Decisions (locked with the user, design-tree interview 2026-08-29):**

1. Scope: **global shortcuts only** — no per-page navigation keys, no roving-focus work.
2. Search surface: **`SearchPalette`**, the one search + command surface.
3. Index: pages + components; **prop names, slug, category and tagline words as `keywords`**
   (typing `avoidCollisions` lands on Tooltip). Tokens deferred (the inventory is hand-listed
   markup, not data).
4. Matching: the palette's built-in case/diacritic-insensitive filter, unchanged.
5. **No single-letter go-to keys** — the palette reaches any page in two keystrokes and bare
   letters collide with NVDA/JAWS quick-nav. Only `/` and `?` stay bare.
6. **`ShortcutsHelp` editable**; overrides + `characterKeys` persisted in `localStorage`
   (`dssoca-docs:shortcuts`) via the recipe on `/keyboard`.
7. Hand-rolled header replaced by dssoca **`Topbar`** (`brand` + `userMenu` slots, `tabs={[]}`,
   no stats/services/clock). `Topbar` owns `mod+k` (`onCommand` opens the palette);
   `SearchPalette shortcut={false}` on shell routes, `'mod+k'` on the landing (no Topbar there).
8. Standalone story (not under epic DS-0135).
9. Bindings: `mod+k` · `/` (`docs:search`) · `?, mod+/` (ShortcutsHelp default) ·
   `shift+d` toggle theme (`docs:toggle-theme`) · `shift+s` cycle size (`docs:cycle-size`).
10. Palette groups **Pages · Components · Actions**; guide pages gained `NavItem.keywords`.
11. Actions: Toggle theme · Cycle size · Keyboard shortcuts (opens the overlay) · Copy install
    command (`pnpm add dssoca` → clipboard + `toast`) · GitHub · Storybook. External links use a
    `url` field opened with `window.open` — **not** `href`, because the palette activates `href`
    items through their real anchor, which would navigate the tab away.
12. Palette + help + registry bindings mounted in `+layout.svelte` for **every route**, landing
    included; `Toaster` mounted for the copy action.
13. Theme/size state extracted to `documentation/src/lib/axes.svelte.ts` so the topbar buttons, the
    palette actions and the shortcuts share one source of truth (`applyDesignConfig`).
14. Tests: node-only docs suite — pure `search.ts` unit tests + source-text contract assertions
    (`keyboard-shell.test.ts`, house pattern); wiring verified in headless Chromium.
15. `/keyboard` gained a **"Try it on this site"** section (live `Kbd` table); the SearchPalette and
    ShortcutsHelp component docs point at the live instances.
16. Help overlay groups: `Appearance` (theme, size) first, `General` (help, search, `/`) last
    (`ShortcutsHelp` forces General last).

### Prior art

- **Docusaurus / Starlight / Nextra** — `⌘K` search palette as the primary navigation surface; `/`
  as a secondary opener.
- **shadcn/ui (`cmdk`)** — grouped palette mixing pages and actions; no dedicated hotkeys beyond
  the opener.
- **GitHub** — `?` shortcuts overlay listing every binding; `/` focuses search.
- **WCAG 2.1.4** — character-key shortcuts need a turn-off / remap mechanism → editable
  `ShortcutsHelp` + persisted overrides.

## Tasks

- [x] `documentation/src/lib/search.ts`: `buildSearchItems()` (pages / components / actions),
      `taglineWords`, `url` for external items; `NavItem.keywords` filled for all 8 guide pages
- [x] `documentation/src/lib/axes.svelte.ts` + `ThemeControls.svelte` refactored onto it
- [x] `documentation/src/lib/shortcut-persistence.ts` (`restore` / `save`, storage-safe)
- [x] `+layout.svelte`: `Topbar` (brand/userMenu slots, `onCommand`), `SearchPalette`,
      `ShortcutsHelp editable`, `Toaster`, `shortcuts.add` × 3 with disposers, persistence effect,
      `<main id="main" tabindex="-1">` as the skip-link target
- [x] Tests: `test/search.test.ts`, `test/keyboard-shell.test.ts`, `branding.test.ts` file list
      extended to the new modules
- [x] Docs: `/keyboard` "Try it on this site"; `search-palette.ts` / `shortcuts-help.ts` notes
- [x] Headless-Chromium verification of the wiring (palette on `mod+k` + `/`, `?` overlay,
      `shift+d`/`shift+s` flip `<html>` attributes, landing `mod+k`, persistence across reload)
- [x] Agile: this story, `node build.mjs`

## Acceptance criteria

- `mod+k` and `/` open the palette on every route (landing included); typing a prop name lists
  its component; Enter navigates; external items open a new tab and keep the docs tab.
- `?` opens the editable overlay listing Appearance + General groups; a remap survives a reload.
- `shift+d` toggles `data-theme`, `shift+s` cycles `data-size-variant` on `<html>`; the topbar
  buttons stay in sync.
- No single-letter navigation keys; `/` and `?` do not fire while typing in an input.
- `pnpm docs:test`, `pnpm docs:build` (prerender), `pnpm test`, `pnpm lint`, `pnpm check`,
  `pnpm format:check` green.

## Notes

- Follow-ups (not this story): tokens in the index (needs the `/tokens` inventory as data), a
  filter box on the `/components` grid, per-page navigation keys.
- Related: [[DS-0133-search-palette]], [[DS-0138-shortcuts-help-overlay]],
  [[DS-0139-dogfood-topbar-searchpalette]], [[DS-0140-keyboard-guide-page]],
  [[DS-0141-editable-shortcuts-help]].
