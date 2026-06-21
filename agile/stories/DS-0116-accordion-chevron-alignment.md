---
id: DS-0116
type: story
title: "Accordion indicator: centred Icon chevron replacing the CSS-border caret"
status: done
priority: high
tags: [accordion, icon, a11y]
depends_on: [DS-0109, DS-0110]
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a user, I want the open/close indicator in `src/lib/components/Accordion.svelte` to look vertically centred in its box at every size, because today it is a CSS-border caret (`<span class="chevron">` with `border-right` + `border-bottom`, rotated 45deg collapsed → 225deg expanded). With that technique the visible mark only occupies one corner of the square box — half the element is empty space — so although the element centres via flex, the visible glyph reads as off-centre (and the rotation pivot sits in dead space). I want the indicator to be a real centred glyph rendered through the shared `Icon` component so its artwork is centred in a fixed square box and rotation pivots cleanly about the visual centre.

## Acceptance criteria
- [x] The CSS-border `.chevron` span is replaced by an `Icon` chevron glyph rendered in a fixed square box, vertically and horizontally centred in that box at sm/md/lg.
- [x] A `chevron` glyph is added to the Icon component (today it ships only `arrow`); coordinate this with [[DS-0110-icons-via-icon-component]] so the Accordion routes its indicator through `Icon` rather than bespoke CSS.
- [x] The glyph rotates between collapsed and expanded states (e.g. 0deg → 180deg, or down → up), animating over `var(--ss-dur) var(--ss-ease)` with `transform-origin: center`, and collapsing instantly under `prefers-reduced-motion` (via `--ss-dur: 0ms`).
- [x] The indicator size scales with the size axis through the Icon size scale ([[DS-0109-icon-size-scale]]); the bespoke `--ss-acc-chevron` token is removed or repointed at the Icon size so nothing hardcodes px.
- [x] The indicator keeps `aria-hidden="true"` (state is already conveyed by `aria-expanded` on the header button) — no a11y regression; vitest-axe stays clean.
- [x] Colour stays `var(--ss-fg-muted)` (or current muted token); zero border-radius; styling scoped SCSS with `--ss-*` tokens; `.ss-*` reserved for the root.
- [x] Tests added/updated; `pnpm test` green (vitest-axe where UI changes).
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed).

## Notes
- Refinement research: Carbon's Accordion renders the indicator as a real chevron SVG (`bx--accordion__arrow`) and rotates it with a CSS `transform: rotate(...)` on the expanded state — the SVG artwork is centred at whole-pixel coordinates so the rotation pivots about the visual centre, which is exactly the off-centre problem a border-caret has. Radix leaves the icon to the consumer but the canonical example wraps a Lucide/Radix `ChevronDown` SVG and applies `transition: transform; transform: rotate(180deg)` on `[data-state=open]`. Both rely on a square, centred glyph rather than a corner-anchored border mark. Carbon also documents the chevron-rotation-direction inconsistency (issue #8360) as a caution — pick one consistent rotation direction. Sources: https://carbondesignsystem.com/components/accordion/usage/ , https://carbondesignsystem.com/components/accordion/code/ , https://github.com/carbon-design-system/carbon/issues/8360 , https://www.radix-ui.com/primitives/docs/components/accordion
- Depends on DS-0109 (icon size scale, so the chevron rescales on the size axis) and DS-0110 (routing accordion icons through the Icon component / adding the `chevron` glyph). Sequence after both.
- Independent of the padding fix (DS-0115); they touch different parts of the panel.
