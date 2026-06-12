---
id: DS-0086
type: story
title: "Spinner component"
status: done
priority: high
tags: [ui, components, a11y]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer, I want a standalone **Spinner** loading indicator. `Button` already
embeds one for its loading state, but it is private — nothing exportable exists for
empty-page or inline loading, so passoca (and any consumer) must draw its own and match the
DS look by eye. Extract/build the spinner as a first-class component so the same glyph serves
Button, page-level loading, and inline "fetching…" affordances.

## Acceptance criteria
- [x] `Spinner` component with `.ss-spinner` identity root, exported from the barrel. (Barrel
  export lands in the integration step — `index.ts` is owned there.)
- [x] Sized from `--ss-*` tokens (rescales across sm/md/lg) with a size override for inline
  vs page-level use; zero border-radius; respects `prefers-reduced-motion` (static first
  frame, no cycling).
- [x] Announced correctly to AT (`role="status"` + visually-hidden — or visible — label;
  frames are `aria-hidden`) — WCAG 2.2 AA.
- [x] `Button`'s loading state reuses it (or shares its markup/tokens) so the two never drift.
  *Superseded:* the direction changed to text-frame spinners from cli-spinners rather than
  extracting Button's drawn glyph; `Button` stays untouched here, and adopting `Spinner`
  inside Button is a follow-up.
- [x] Tests cover rendering, a11y role/label, and reduced-motion; `pnpm test` green,
  `pnpm pack` clean. (Frame cycling is tested deterministically with fake timers.)
- [x] Documentation updated (new docs.config.ts component page; `docs/tokens.md` for any new tokens).
  (New `component-docs/spinner.ts` page; registration in `docs.config.ts`'s COMPONENTS list and
  the `--ss-spinner-*` token rows in `docs/tokens.md` land in the integration step.)

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]].
- Site workaround removed: passoca's hand-rolled loading indicators for page/inline states.
- **Attribution:** the animation frames + intervals are embedded verbatim from
  [sindresorhus/cli-spinners](https://github.com/sindresorhus/cli-spinners) (MIT license) —
  ten squared/blocky variants curated for the zero-radius look (`boxBounce2` default,
  `boxBounce`, `squareCorners`, `toggle2`, `toggle3`, `toggle4`, `pipe`, `line`,
  `growVertical`, `growHorizontal`). Embedded as a typed record; no runtime fetch, no new
  dependency.
- Implementation: cycles frames with `$state` + `$effect` `setInterval` at the variant's
  cli-spinners interval (`speed` overrides); glyphs render in `--ss-font-mono`, colored by
  `--ss-spinner-color` (defaults to `--ss-primary`), sized by `--ss-spinner-font` (new
  partial `src/styles/components/_spinner.scss`, to be wired into `components/_index.scss`).
  `'Spinner'` still needs adding to the `COMPONENT_NAMES` union in `dssoca.config.ts` (cast
  in the component until then).
