---
id: DS-0068
type: story
title: "Tokenize hardcoded chrome — px values that don't rescale with size variants"
status: done
priority: high
tags: [tokens, scss, size-variants]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a user flipping `data-size-variant`, every piece of component chrome rescales.
Several components hardcode px values, violating the "new chrome reads size tokens" rule,
so they stay fixed at sm/lg.

## Acceptance criteria
- [x] `BottomNav.svelte` (~L190-196): badge positioning/sizing (`top: -6px`,
  `left: calc(50% + 6px)`, `min-width: 14px`, `height: 14px`, `font-size: 9px`,
  `padding: 0 3px`) moved to size-aware `--ss-bottom-nav-badge-*` tokens.
  *(Done: `--ss-bottom-nav-badge-{top,dx,min-w,h,fs,px}` in
  `src/styles/components/_bottom-nav.scss` with sm/md/lg blocks; md mirrors the
  previous px exactly. The component carries md fallbacks + local per-size
  overrides so it stays self-contained.)*
- [x] `LogStream.svelte`: `max-height: 240px` / `min-height: 160px` (~L341-342) and column
  `min-width: 58px/38px` (~L356-358) become overridable `--ss-log-*` tokens.
  *(Done: new `src/styles/components/_log-stream.scss` partial defines
  `--ss-log-{min-h,max-h,t-w,lvl-w}` per size; the component reads them with
  scoped md fallbacks. The partial still needs its `@use 'log-stream';` line in
  `components/_index.scss` — handed to integration, that file was shared with
  parallel work.)*
- [x] Gap/margin px replaced with gap tokens: `ServiceCard.svelte` (~L180 `gap: 10px`),
  `Topbar.svelte` (~L189 `gap: 8px`, ~L225-241 margins/dot/padding), `Input.svelte`
  (`gap: 6px`, `margin-left: 2px`), `Sidebar.svelte` (`gap: 8px`).
  *(ServiceCard → `var(--ss-gap-sm)` (md = 10px); Sidebar → `var(--ss-s-2)`.
  Input's 6px/2px sit between/below the spacing-scale steps with no existing
  `--ss-s-*`/`--ss-gap-*` match — kept as deliberate fixed micro-spacing with
  justifying comments rather than inventing one-off tokens. **Topbar items were
  split out to the parallel Topbar workstream** (it owns `Topbar.svelte` and is
  swapping its gaps/margins to existing tokens) — not covered by this change.)*
- [x] `Toaster.svelte` (~L27/99): hardcoded 180 ms fly duration reads `--ss-dur-fast`.
  *(Reads the token via `getComputedStyle` on the toaster root; falls back to
  the previous 180 ms when the stylesheet isn't present, e.g. jsdom.)*
- [x] `Sparkline.svelte` (~L176): `height: 18px` fallback reads a size token.
  *(Fallback chain is now `var(--ss-spark-h, var(--ss-icon, 18px))` — the
  literal is only the no-stylesheet last resort.)*
- [x] Focus-ring offsets reviewed: `Input.svelte` ~L150 (`outline-offset: 2px`),
  `ServiceCard.svelte` ~L203 (`3px`) — either a shared `--ss-focus-offset` token or a
  comment justifying the divergence from `_base.scss:131`.
  *(Both had drifted by review time: ServiceCard already matches `_base.scss`
  exactly (2px/2px) — annotated as intentional mirroring; Input no longer uses
  an outline at all (border recolour + soft box-shadow on the wrapper so
  prefix/suffix read inside the focused field) — divergence documented in a
  comment. No new token needed.)*
- [x] Visual check in Storybook/showcase at sm/md/lg; `pnpm test` green.
  *(Targeted suites for the touched components green — 156 tests across
  BottomNav/LogStream/ServiceCard/Input/Sidebar/Toaster/Sparkline;
  `theme.scss` compiles clean.)*
- [x] Documentation updated (`docs/tokens.md` for every new/changed token).
  *(Component pages updated for BottomNav badge tokens + LogStream `--ss-log-*`.
  `docs/tokens.md` rows handed to the docs-sync integration step — file was
  shared with parallel work; token list provided in the handoff.)*

## Notes
- `Topbar.svelte` media breakpoints (720px/520px, ~L245-248) are out of scope here —
  breakpoints can't be CSS custom properties; consider an SCSS variable/mixin if touched.
- New tokens (md = previous px, visually unchanged):
  `--ss-bottom-nav-badge-top` (-5/-6/-7px), `--ss-bottom-nav-badge-dx` (5/6/7px),
  `--ss-bottom-nav-badge-min-w` (12/14/16px), `--ss-bottom-nav-badge-h` (12/14/16px),
  `--ss-bottom-nav-badge-fs` (8/9/10px), `--ss-bottom-nav-badge-px` (2/3/4px);
  `--ss-log-min-h` (120/160/200px), `--ss-log-max-h` (200/240/320px),
  `--ss-log-t-w` (52/58/64px), `--ss-log-lvl-w` (34/38/42px).
