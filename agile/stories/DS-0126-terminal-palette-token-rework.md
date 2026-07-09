---
id: DS-0126
type: story
title: "Root-slot palette generator + two-layer token restructure"
status: done
priority: high
tags: [tokens, colors, oklch, breaking]
depends_on: []
parent: null
epic: DS-0125
created: 2026-07-09
updated: 2026-07-09
---

## Description

As a design-system consumer, I want the whole color surface derived from one seeded 16-slot
terminal palette, so that theming is systematic (one recipe, both themes) and a future custom
palette can recolor everything by overriding 19 custom properties.

Implementation: `scripts/lib/palette.mjs` (dependency-free OKLCH math + `derivePalette` recipe +
`emitTokensRegion`; typed via a hand-written `.d.mts`), `scripts/generate-palette.mjs`
(`pnpm gen:palette`, rewrites the marked region of `src/styles/_tokens.scss`), and the token file
split into Layer A (generated `oklch()` root slots ×2 themes, with hex comments) and Layer B
(semantic tokens as `var()` aliases / `color-mix()` derivations inside the `[data-theme]` blocks).

## Acceptance criteria

- [x] 19 root slots per theme generated in OKLCH; dark `--ss-accent` = `#66ef73` verbatim.
- [x] Every text-role slot ≥4.5:1 (WCAG 2.2 AA) on `--ss-bg` AND `--ss-bg-elev` in both themes,
      asserted mathematically in `test/unit/palette-generator.test.ts`.
- [x] red↔green OKLCH hue distance ≥45° in both themes (diff legibility), adjacent slots ≥25°.
- [x] Neutrals hue-tinted toward the accent; no pure `#000`/`#fff` anywhere.
- [x] Layer B: primary/success→accent, danger→red, code palette→slots (string=green,
      keyword=magenta, comment=bright-black), badge tones→slot washes, all washes as `color-mix`.
- [x] Deprecated aliases shipped: `--ss-purple: var(--ss-magenta)`, `--ss-lime: var(--ss-green)`.
- [x] `--ss-primary-rgb`/`--ss-red-rgb` deleted; `--ss-shadow-glow` + `_image.scss` shimmer
      re-derived via `color-mix`.
- [x] Drift-guard test: the committed generated region byte-matches the recipe.
- [x] `tokens-css` structural test compiles `tokens.scss` with Dart Sass and pins the layer
      contract (slots present ×2, aliases present, no `-rgb:`, no raw brand rgba).
- [x] `docs/tokens.md` color sections rewritten (root-slot table, semantic derivation table,
      deprecation/removal + migration recipes); `DESIGN.md` color-axis section corrected.

## Notes

- OKLCH chosen over HSL so "same lightness across hues" is actually true (HSL lies — the old
  light-theme yellow hack); over culori/dep so the math stays a single auditable module shared
  with the docs Theme Builder.
- Refinement research: Radix Colors / Material 3 derive palettes as perceptual ramps per hue —
  here the ramp dimension is replaced by the ANSI slot structure (mono-design reference), but the
  perceptual-space + contrast-solved approach matches theirs.
