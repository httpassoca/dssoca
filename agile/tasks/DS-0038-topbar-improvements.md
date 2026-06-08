---
id: DS-0038
type: task
title: "Topbar improvements"
status: todo
priority: low
tags: [ui, a11y, app-shell]
depends_on: []
parent: DS-0025
epic: DS-0016
created: 2026-06-08
updated: 2026-06-08
---

## Description
Implement the researched improvements for `Topbar` (`src/lib/components/Topbar.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Wrap in `<header>`/`<nav>` landmarks** — make the root `<header>` and wrap the tab group in `<nav aria-label="Primary">` (mirrors Sidebar)
- [ ] **Skip-to-content link** — add a visually-hidden-until-focused skip link as the first focusable child (`skipTarget?` default `#main`)
- [ ] **Roving tabindex + arrow-key nav** — active tab `tabindex=0`, rest `-1`; Left/Right (wrap) + Home/End move focus — labelled `<nav>`, not a faux tablist
- [ ] **Wire ⌘K to a real action** — add `onCommand?`, a global `Cmd/Ctrl+K` listener (with cleanup) and a real `<button aria-keyshortcuts>` trigger
- [ ] **Interactive user menu** — replace the plain user string with `onUser?` button or a `userMenu?` Snippet (avatar/menu)
- [ ] **Data-driven brand + stats** — add `brand?` Snippet and a `stats?: {key,value,title?}[]` prop, keeping current values as defaults
- [ ] **Responsive collapse + `sticky` opt-out** — collapse stat segments/nav at narrow widths, add `sticky?: boolean`, and verify ≥24×24px hit targets at sm
- [ ] Tests extended in `test/unit/Topbar.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0025-topbar-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
