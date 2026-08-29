---
id: DS-0146
type: story
title: "Tooltip — collision-aware placement (auto flip + shift, `avoidCollisions`)"
status: done
priority: low
tags: [ui, components, tooltip, a11y, api]
depends_on: []
parent: null
epic: null
created: 2026-08-29
updated: 2026-08-29
---

## Description

As a consumer of dssoca, I want a `Tooltip` to stay visible wherever its trigger sits. Today the
tip is positioned purely in CSS from the `placement` prop, so a `placement="top"` tooltip on a
button in the top toolbar (or any trigger at a viewport edge, or inside a scrolling `Panel`) renders
off-screen / clipped and is simply invisible.

**Decisions (locked with the user, design-tree interview 2026-08-29):**

1. **Technique — manual measurement on open**, not a dependency. `@floating-ui/dom` would be the
   first runtime UI dependency in dssoca; CSS Anchor Positioning (`anchor()` +
   `position-try-fallbacks`) is Baseline 2026 but only ~83–91% coverage (Safari 26+, Firefox 147+),
   gives *no* flip at all on older browsers and can't be exercised in jsdom. ~60 lines of
   `getBoundingClientRect` math (what Floating UI's `flip` + `shift` do internally) works
   everywhere and is testable.
2. **Scope**: flip → opposite side first → perpendicular side with more room → else the roomiest
   side; plus a **cross-axis shift** so a corner trigger's tip slides along the edge.
3. **Boundary**: viewport ∩ every ancestor with `overflow` ≠ `visible` (scrolling Panel, Modal
   body, table wrapper) — the tip is `position: absolute` and gets clipped there, not at the viewport.
4. **Opt-out**: `avoidCollisions?: boolean` (default `true`, Radix naming). Auto is the default
   because the bug *is* the default experience.
5. **Re-measure** on `window` `scroll` (capture + passive, so nested scroll containers count) and
   `resize`, listeners attached only while open; also live when `placement`/`avoidCollisions` change
   while open. No `ResizeObserver` on the tip.
6. **Shift padding** = `--ss-tooltip-offset` (6px), the same gap the tip keeps from its trigger — no
   new token.
7. **`data-placement` reflects the resolved side** so the existing placement CSS is untouched.
8. **Shift** is a `--shift` custom property set inline and folded into the existing
   `translateX/Y(calc(-50% + var(--shift)))` transforms (incl. reduced-motion rules).

Enabling detail: the closed tip already has layout — its author `display: block` beats the UA
`[hidden] { display: none }` (hiding is `visibility`/`opacity`) — so it can be measured before reveal.

### Prior art

- **Floating UI** — `flip` (opposite, then perpendicular fallbacks) + `shift` middleware; boundary =
  clipping ancestors. This story reimplements that subset inline.
- **Radix Tooltip** — `avoidCollisions` (default `true`), `collisionBoundary`, `collisionPadding`.
- **MUI / Ant Design** — Popper-based auto flip on by default.
- **CSS Anchor Positioning** — `position-try-fallbacks: flip-block, flip-inline` (Chrome 125+,
  Safari 26+, Firefox 147+). Noted as a future progressive enhancement, not a backlog item.

Non-breaking: every existing call site keeps working; only edge-of-screen tips move.

## Tasks

- [x] `Tooltip.svelte`: `avoidCollisions` prop; `flipped`/`shift` state, `resolved` derived;
      `clippingBoundary()` + `position()`; one `$effect` (open + props) for positioning and
      scroll/resize listeners; `data-placement={resolved}`, `style:--shift`
- [x] CSS: `--shift: 0px` on `.tip`, folded into all placement + reduced-motion transforms
- [x] Tests (`test/unit/Tooltip.svelte.test.ts`, `avoidCollisions` on `TooltipHarness`): stubbed
      rects/viewport; keeps side with room (×4), flips top/bottom/left, perpendicular fallback,
      roomiest side, ± shift (x and y), clipping ancestor, opt-out, reset on close, live prop
      change, resize re-measure, axe clean on a flipped tip
- [x] Storybook: `avoidCollisions` arg + _Edge of viewport_ story (4 fixed edge triggers + a
      scroll box)
- [x] Docs (`documentation/src/lib/component-docs/tooltip.ts`): `placement` reworded to
      preferred side, `avoidCollisions` row, notes paragraph on flip order / shift / boundary / opt-out
- [x] Agile: this story, `node build.mjs`

## Acceptance criteria

- A `placement="top"` tooltip on a trigger at the top of the viewport opens **below** it; at a side
  edge the tip slides inward instead of overhanging; inside an `overflow: auto` box it stays inside
  the box.
- With room on the preferred side nothing changes (visual regression = none).
- `avoidCollisions={false}` restores the fixed behaviour.
- SSR output unchanged (no measurement at render time; `data-placement` = the prop).
- `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm docs:test`,
  `pnpm build-storybook`, `pnpm pack` green.

## Notes

- Future enhancement: layer native CSS Anchor Positioning on top (`position-anchor` +
  `position-try-fallbacks`) once coverage is near-universal, keeping the JS path as the fallback.
- Related: [[DS-0098-tooltip-implementation]], [[DS-0144-tooltip-snippet-content]].
