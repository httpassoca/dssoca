---
id: DS-0142
type: story
title: "Preset terminal themes — PRESET_THEMES + Theme Builder examples"
status: done
priority: low
tags: [theming, palette, docs, a11y]
depends_on: [DS-0125]
parent: null
epic: null
created: 2026-07-12
updated: 2026-07-12
---

## Description

As an app using dssoca, I want ready-made palettes ported from well-known terminal themes so I
can adopt a familiar look (Dracula, Gruvbox, Nord, …) with one line instead of hand-authoring 38
hex values. The palette architecture (DS-0125) makes this pure data: 19 slots per mode, applied
via the existing `applyDesignConfig({ palette })` / `paletteToCss()` paths.

Ships the author's site themes (Dracula, Tokyo Night, Coffee) plus the classics (Gruvbox, Nord,
Solarized) as `PRESET_THEMES` in a new `src/lib/presets.ts`, surfaced in the docs Theme Builder
as example buttons that load the full palette as slot overrides.

**Decisions (locked with the user):**

- **Official modes only** — a preset carries only the modes its upstream defines (Nord has no
  official light; Coffee is the site's light-only custom theme). `presetPalette()` fills the
  `Palette` shape by mirroring the single mode into both, so a theme flip keeps the colors.
- **Faithful + AA-fixed** — hue slots upstream-verbatim; slots failing the theme-builder's WCAG
  2.2 AA checks nudged along OKLCH lightness only, each with an `// AA-fixed from #…` comment.
  Policy explained in `docs/themes.md` → _Preset palettes_.
- **Role-mapped neutrals** — terminal light themes map `ansiBlack` → bg / `brightWhite` → dark
  text; dssoca's semantic layer expects black = ink, brightWhite = lightest surface/shine,
  brightBlack = muted text. Neutrals are assigned by role from the theme's own official colors.
- **Sources verified upstream**: Dracula spec ANSI + official Alucard Classic,
  folke/tokyonight.nvim Night + Day extras, morhetz/gruvbox dark + light (alacritty ports),
  nordtheme terminal spec, Solarized official ANSI mapping. Coffee derived from the site accent
  `#6a461e` with `derivePalette`, anchored to the site's `#f9dec9` bg.

## Tasks

- [x] Verify the six upstream 16-ANSI palettes (web sources above)
- [x] Bake AA fixes with the theme-builder `runChecks` + fix-until-stable loop (plus fg-shine
      role checks: dark `brightWhite` / light `black` ≥ 7:1 on bg)
- [x] `src/lib/presets.ts` — `PresetTheme`, `PRESET_THEMES`, `presetPalette()`; barrel re-export
- [x] Theme Builder: terminal presets appended to `PRESETS` (imported from the library source),
      `pickPreset` loads full palettes as slot overrides; intro copy mentions them
- [x] AccentControls: gap between the swatch dot and the label (`margin-inline-end` on `.dot` —
      both are children of Button's `.label`, which has no gap)
- [x] Tests: `test/unit/presets.test.ts` (data invariants, WCAG guard mirroring the corrector
      checks, `presetPalette` mirroring/throw, config round-trip); docs `theme-derive` /
      `theme-checks` extended (by-construction case scoped to seed presets)
- [x] Docs: `docs/themes.md` _Preset palettes_ section; theming guide `+page.svx` section

## Acceptance criteria

- `applyDesignConfig({ palette: presetPalette('dracula') })` and
  `paletteToCss(presetPalette(...))` work for all six presets; single-mode presets mirror.
- Every shipped mode passes the corrector's contrast targets (pinned by the library suite).
- Theme Builder preset buttons load the exact palettes; every slot stays hand-tunable; the
  dot/label gap renders.
- `pnpm test`, `pnpm docs:test`, `pnpm check`, `pnpm lint`, `pnpm pack` green.
