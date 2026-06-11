---
id: DS-0068
type: story
title: "Tokenize hardcoded chrome — px values that don't rescale with size variants"
status: todo
priority: high
tags: [tokens, scss, size-variants]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a user flipping `data-size-variant`, every piece of component chrome rescales.
Several components hardcode px values, violating the "new chrome reads size tokens" rule,
so they stay fixed at sm/lg.

## Acceptance criteria
- [ ] `BottomNav.svelte` (~L190-196): badge positioning/sizing (`top: -6px`,
  `left: calc(50% + 6px)`, `min-width: 14px`, `height: 14px`, `font-size: 9px`,
  `padding: 0 3px`) moved to size-aware `--ss-bottom-nav-badge-*` tokens.
- [ ] `LogStream.svelte`: `max-height: 240px` / `min-height: 160px` (~L341-342) and column
  `min-width: 58px/38px` (~L356-358) become overridable `--ss-log-*` tokens.
- [ ] Gap/margin px replaced with gap tokens: `ServiceCard.svelte` (~L180 `gap: 10px`),
  `Topbar.svelte` (~L189 `gap: 8px`, ~L225-241 margins/dot/padding), `Input.svelte`
  (`gap: 6px`, `margin-left: 2px`), `Sidebar.svelte` (`gap: 8px`).
- [ ] `Toaster.svelte` (~L27/99): hardcoded 180 ms fly duration reads `--ss-dur-fast`.
- [ ] `Sparkline.svelte` (~L176): `height: 18px` fallback reads a size token.
- [ ] Focus-ring offsets reviewed: `Input.svelte` ~L150 (`outline-offset: 2px`),
  `ServiceCard.svelte` ~L203 (`3px`) — either a shared `--ss-focus-offset` token or a
  comment justifying the divergence from `_base.scss:131`.
- [ ] Visual check in Storybook/showcase at sm/md/lg; `pnpm test` green.
- [ ] Documentation updated (`docs/tokens.md` for every new/changed token).

## Notes
- `Topbar.svelte` media breakpoints (720px/520px, ~L245-248) are out of scope here —
  breakpoints can't be CSS custom properties; consider an SCSS variable/mixin if touched.
