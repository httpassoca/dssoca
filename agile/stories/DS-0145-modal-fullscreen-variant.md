---
id: DS-0145
type: story
title: "Modal — fullscreen variant (`fullscreen` prop)"
status: done
priority: low
tags: [ui, components, modal, a11y, api]
depends_on: []
parent: null
epic: null
created: 2026-08-16
updated: 2026-08-16
---

## Description

As a consumer of dssoca, I want a `Modal` that fills the viewport, so content that needs the whole
screen — a `LogStream` tail, a `Table`, a diff, an image, a multi-step form on a phone — isn't
squeezed into a 24/32/48rem panel. Today the dialog is always a centred, capped box
(`--ss-modal-w` per size variant, `max-width`/`max-height` insets — `src/lib/components/Modal.svelte:133`).

**Decision (locked with the user):** a boolean `fullscreen?: boolean` prop, **not** a `size="full"`
value. The size axis is a global design axis (`sm|md|lg`, inherited from `data-size-variant`);
"full" is a layout mode, not a scale step, and overloading the axis would break inheritance. When
`fullscreen` is set the size axis is simply ignored for width. Responsiveness stays with the
consumer (`fullscreen={innerWidth < 640}`) — no breakpoint token is invented here.

**Shape:** panel fills the viewport (`100dvw` × `100dvh`, `vw/vh` fallback), `margin: 0`, width and
max-width/height caps removed, no outer border; the header and footer stay pinned (`flex: none`)
while `.body` takes the remaining height and owns the scroll. Everything else — native `<dialog>`
focus trap, Esc, `closeOnEsc`, `onclose`, `header`/`footer` snippets, `danger` — is unchanged.

**Known interaction:** with a full-bleed panel there is no visible backdrop left to click, so
`closeOnBackdrop` becomes unreachable (the pointerdown-target check simply never matches). That is
expected, not a bug — document it, and keep the close button + Esc as the exits. Because there's no
gap either, the `::backdrop` tint is invisible; it stays declared, harmless.

### Prior art

- **MUI Dialog** — `fullScreen` boolean, and the documented responsive recipe is exactly
  "compute it with `useMediaQuery` and pass it in" (consumer-driven, as decided here).
- **Joy UI Modal** — `layout="fullscreen"` alongside `center`.
- **Material Design 3** — treats the *full-screen dialog* as its own mobile pattern: pinned top bar
  carrying the title plus the dismiss and confirm actions, body scrolls beneath.
  → maps cleanly onto our pinned `head`/`foot` + scrolling `body`.
- **Semrush Intergalactic** ships a separate `FullscreenModal`; we keep one component with a mode,
  since the header/body/footer anatomy is identical.
- **Svelte 5 / platform**: no runes changes needed — the mode is pure attribute + CSS, so the
  existing `$effect` mirroring of `open` onto `showModal()`/`close()` is untouched. `100dvh` is the
  correct unit for mobile browser chrome (`100vh` overshoots).

## Tasks

- [x] `Modal.svelte`: `fullscreen?: boolean` (default `false`) → `data-fullscreen` on the `<dialog>`
      (matching Sidebar's `data-collapsed` convention rather than adding a class); JSDoc covers the
      inert size axis and the `closeOnBackdrop` caveat
- [x] SCSS: `&[data-fullscreen]` — `100vw`/`100vh` with a `@supports (height: 100dvh)` upgrade to
      `dvw`/`dvh`, `max-width`/`max-height: none`, `margin: 0`, `border: 0`;
      `.panel { height: 100%; max-height: none }`, `.head`/`.foot { flex: none }`,
      `.body { flex: 1 1 auto; min-height: 0 }` (the body already owned `overflow: auto`)
- [x] Size variants stay declared but inert (they only set `--ss-modal-w`, which the fullscreen
      block overrides); no hardcoded px added — the existing `--ss-modal-*` pad tokens are reused,
      so no token changes and no `docs/tokens.md` edit
- [x] Tests (`test/unit/Modal.svelte.test.ts`, 7 new): off by default, `data-fullscreen` when set,
      size axis still reflected, full header/body/footer anatomy, close button + `onclose`,
      `closeOnEsc={false}` still prevents `cancel`, `vitest-axe` clean
- [x] Storybook (`src/stories/Modal.stories.svelte`): _Fullscreen_ story — a `fullscreen` arg plus
      extra body copy so the pinned head/foot and scrolling body are visible, footer pair retained
- [x] Docs (`documentation/src/lib/component-docs/modal.ts`): `fullscreen` prop row, usage example,
      notes on the inert size axis, the unreachable `closeOnBackdrop`, and the caller-driven
      responsive recipe
- [x] Agile: status → done, `node build.mjs`

## Acceptance criteria

- `<Modal bind:open fullscreen>` fills the viewport with no insets, zero radius, header/footer
  pinned, body scrolling; `<Modal bind:open>` is pixel-identical to today.
- Keyboard: focus is trapped by the native dialog, Esc closes (unless `closeOnEsc={false}`), the
  close button is reachable and has a visible focus ring; both themes and all three size variants
  render correctly.
- Long body content scrolls inside `.body`; the page behind never scrolls.
- Docs record the two behavioural notes (size axis ignored, `closeOnBackdrop` unreachable).
- `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm docs:test`,
  `pnpm build-storybook`, `pnpm pack` green.

## Notes

- Non-breaking, additive: default `false` keeps current behaviour.
- **Not visually verified on this host**: the extracted chromium runtime libs the `verify` skill
  relies on are gone from `/tmp` and the sandbox has no `apt`/`dpkg` to re-fetch them, so the
  layout was checked by reading the compiled CSS in `dist/components/Modal.svelte` (rules emitted as
  intended) plus the unit suite. Eyeball the Storybook _Fullscreen_ story (or the PR's Storybook
  preview deploy) to confirm the pinned head/foot + scrolling body.
- Deliberately out of scope: a `fullscreen="mobile"` auto mode (MUI leaves this to the consumer
  too) and any entry/exit animation for the mode.
- Related: [[DS-0094-modal-implementation]] (Modal implementation), [[DS-0123-card-modal-footer-stories]] (footer stories
  this variant should mirror).
