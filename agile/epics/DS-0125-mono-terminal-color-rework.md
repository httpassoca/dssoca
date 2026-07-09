---
id: DS-0125
type: epic
title: "Monochromatic 16-slot terminal color rework"
status: in-progress
priority: high
tags: [ui, epic, colors, tokens, theming, breaking]
depends_on: []
parent: null
epic: null
created: 2026-07-09
updated: 2026-07-09
---

## Description

Rework the color system into a **monochromatic terminal palette**: a generated root layer of the
16 ANSI colors + `bg`/`fg` + one vivid `--ss-accent` per theme (authored in OKLCH, seeded from the
brand green `#66ef73` which stays byte-for-byte identical), and a hand-maintained semantic layer
where every existing `--ss-*` token derives from those slots via `var()`/`color-mix()`. Neutrals
carry the accent's hue at low chroma (mono rule — bg strongest, whites faintest); the six hue slots
keep classic ANSI anchor hues leaned ~35% toward the accent, with red↔green held ≥45° apart so git
diffs stay legible. The palette doubles as a terminal color scheme by construction.

The library ships **static, hand-audited values only** (generator: `scripts/generate-palette.mjs`,
recipe + shared OKLCH math in `scripts/lib/palette.mjs`, drift-guard test pins the committed
region). Custom palettes are generated in the documentation app's new interactive **Theme Builder**
page ([[DS-0129-docs-theme-builder]]) and imported via the new config API
([[DS-0127-palette-import-api]]): `applyDesignConfig({ palette })` at runtime or a `paletteToCss`
CSS override block (zero-JS/SSR path).

**Breaking (0.12.0):** the six status hues carry new slot values; `--ss-purple` → `--ss-magenta`
and `--ss-lime` → `--ss-green` (deprecated aliases shipped for one minor); `--ss-primary-rgb` /
`--ss-red-rgb` are removed (comma triplets can't chain through `var()` — replaced by `color-mix`
washes). Design decisions (accent-on-top, hue-tinted neutrals, static tokens, OKLCH) were made
against the mono-design reference generators (~/dev/mono-design) and recorded in the story notes.

## Acceptance criteria

- [ ] All child stories (DS-0126 … DS-0131) are done.
- [ ] `pnpm test`, `pnpm docs:test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green.
- [ ] Visual hand-audit of both themes across showcase + Storybook (all stories × dark/light).
- [ ] CHANGELOG carries a Breaking/Migration block (status-value changes, renames, `-rgb` removal
      recipes, new palette API).
