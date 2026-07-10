---
id: DS-0109
type: story
title: "Icon — constrain to a named size scale (xs 12 / sm 16 / md 20 / lg 24)"
status: done
priority: high
tags: [icon, tokens, sizing]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca consumer, I want `Icon` to render at a small, predictable, named size scale so that
icons read consistently next to text and inside controls, and so other components can pin themselves
to a known icon box.

The new scale is fixed: **xs = 12px, sm = 16px, md = 20px, lg = 24px**. This is a deliberate
*rewrite* of the global `--ss-icon` size-variant tokens — not an icon-local-only override (confirmed
decision). Today `src/styles/_tokens.scss` defines `--ss-icon` per `[data-size-variant]` as sm = 14px,
md = 16px, lg = 20px; this story moves them to **sm = 16px, md = 20px, lg = 24px** (each tier grows by
one step) and `Icon` additionally gains a 12px `xs` step.

Nuance to preserve and document — there are two distinct "size" concepts:
- The **global `data-size-variant` axis stays `sm | md | lg`** (the design system's color/size axes are
  unchanged; see CLAUDE.md). The `--ss-icon` token still resolves per that axis to 16/20/24px.
- **`Icon` gains its own local size union `xs | sm | md | lg`** with a fixed px scale. `xs` (12px) has no
  global `data-size-variant` counterpart — it is an Icon-only opt-in for dense affordances (e.g. inline
  metadata, tight chips). When `Icon`'s `size` is unset it inherits the active `--ss-icon` token; when set
  to `xs` it pins to 12px directly.

In `src/lib/components/Icon.svelte`, update `SIZE_PX` from `{ sm: 14, md: 16, lg: 20 }` to
`{ xs: 12, sm: 16, md: 20, lg: 24 }`, widen the `size` prop type to the local `xs | sm | md | lg` union
(distinct from the global `Size`), and keep `DEFAULT_PX = SIZE_PX.md` (now 20). The `absoluteStroke` math
must stay consistent with the new `resolvedPx`: stroke recomputed as `(strokeWidth * 24) / resolvedPx`, so
a 2u stroke stays optically constant at 12/16/20/24px.

**Blast radius — call out explicitly.** Every auto-sized icon (those that inherit `--ss-icon` rather than
passing an explicit `px`) grows by one step: Button leading/trailing affixes, BottomNav glyphs, Menu
leading visuals, Accordion chevrons, TopBar, etc. The acceptance criteria require a visual/snapshot pass
confirming the larger icons don't break layout harmony (heights, alignment, optical balance). This couples
to [[DS-0111-coordinated-inner-sizes]] (inner sizes must move together) and [[DS-0112-button-icon-height]]
(button must own its line-box so a taller icon doesn't grow the control).

This is **foundational**: it is a prerequisite for [[DS-0110-icons-via-icon-component]],
[[DS-0111-coordinated-inner-sizes]], and [[DS-0116-accordion-chevron-alignment]], which all pin to the
resolved icon scale rather than magic numbers.

## Acceptance criteria
- [x] `--ss-icon` rewritten in `src/styles/_tokens.scss` to sm = 16px, md = 20px, lg = 24px per
      `[data-size-variant]` (replacing 14/16/20); no border-radius touched, `--ss-*` naming preserved.
- [x] `Icon` `SIZE_PX` becomes `{ xs: 12, sm: 16, md: 20, lg: 24 }` and `DEFAULT_PX = SIZE_PX.md` (20px).
- [x] `Icon`'s local `size` prop accepts `xs | sm | md | lg` (Icon-only union, distinct from the global
      `sm | md | lg` axis); unset `size` still inherits `var(--ss-icon)`; `size="xs"` resolves to 12px.
- [x] `absoluteStroke` recomputes stroke from the new `resolvedPx` so a 2u stroke is optically constant at
      12/16/20/24px (verify the math: `(strokeWidth * 24) / resolvedPx`).
- [x] The global `data-size-variant` axis is unchanged (still `sm | md | lg`); `xs` is documented as an
      Icon-local option with no global axis equivalent.
- [x] Blast-radius pass: a visual/snapshot review of every auto-sized icon consumer (Button affixes,
      BottomNav, Menu, Accordion chevron, TopBar) confirms the one-step-larger icons don't break layout
      harmony (no clipped, misaligned, or control-growing icons).
- [x] Tests added/updated covering the new scale (each `size` → expected px, `xs` step, absoluteStroke
      output at each tier); `pnpm test` green (vitest-axe where UI changes).
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed) — including the `--ss-icon` value change in `docs/tokens.md` (14/16/20 →
      16/20/24) and the Icon page's `size` prop table (add `xs`, note the fixed px scale).

## Notes
- Refinement research (cited):
  - **IBM Carbon** ships icons at a fixed 16/20/24/32 scale (drawn on a 32×32 grid, scaling cleanly to
    24/20/16). Carbon's guidance: 16px and 20px icons are tuned to feel balanced beside 14px and 16px type;
    use 24px/32px only when larger icons are needed, and keep icon size consistent throughout a product.
    Our 16/20/24 trio mirrors Carbon's lower three tiers exactly — a proven small fixed scale for body-text
    UI. (carbondesignsystem.com — Icons usage; v10 Icons code.)
  - **Material Symbols** recommends sizing icons to 20/24/40/48px (default 24) and uses an *optical-size*
    axis so stroke weight adjusts as the icon scales, keeping the glyph optically constant. We approximate
    that with `absoluteStroke` (recompute stroke from resolved px) rather than a variable-font axis — the
    same optical goal with static SVG. (developers.google.com — Material Symbols guide.)
  - Why `xs` = 12px on top of the scale: Carbon's smallest *production* icon is 16px, but a 12px step is a
    common dense-table / inline-metadata affordance in design systems where a glyph must sit inside ~14px
    text without dominating it. Keeping it Icon-local (not a global `data-size-variant`) avoids polluting the
    cross-cutting size axis while still giving callers a tuned dense option.
  - Takeaway adopted: a small fixed scale (16/20/24) anchored to the type scale, plus an opt-in `xs`, beats
    an open-ended `px`-only API for consistency — `px` stays as the escape hatch.
- File refs: `src/styles/_tokens.scss` (`--ss-icon` per `[data-size-variant]`, ~lines 274/337/400);
  `src/lib/components/Icon.svelte` (`SIZE_PX`, `DEFAULT_PX`, `size` prop type, `resolvedPx`/`stroke` derived);
  `docs/tokens.md` (`--ss-icon` row, ~line 170).
- Cross-links: prerequisite for [[DS-0110-icons-via-icon-component]], [[DS-0111-coordinated-inner-sizes]],
  [[DS-0116-accordion-chevron-alignment]]; couples to [[DS-0112-button-icon-height]] for the height-invariance
  guarantee. Storybook controls for the new scale land in [[DS-0118-icon-storybook-controls]].
