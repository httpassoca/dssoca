---
id: DS-0011
type: story
title: "Design-system config file (typed TS manifest)"
status: done
priority: high
tags: [config, dx, api]
depends_on: []
parent: null
epic: null
created: 2026-06-07
updated: 2026-06-07
---

## Description
As the design-system maintainer, I want a single typed **config file** (`dssoca.config.ts`) that
declares *how the design system works* — the available theming + density and their defaults — so
there's one extensible source of truth that grows as the system gains more configuration. Today
the defaults live implicitly in `src/lib/config.ts` (`defaultDesignConfig`) and the `ColorTheme` /
`Density` unions are hand-written; this story lifts those into a manifest the rest of the code
derives from.

Foundational and **non-breaking** (additive). Sequenced first so [[DS-0012-config-driven-size-system]]
can extend it with the size system.

## Acceptance criteria
- [x] New `src/lib/dssoca.config.ts` exports a typed manifest declaring: available color themes (`dark` = default, `light`), available densities (`comfy` = default, `compact`), and the default config — structured so future options slot in without breaking the shape
- [x] `src/lib/config.ts` derives `defaultDesignConfig` and the `ColorTheme` / `Density` types from the manifest (single source of truth; no duplicated literals)
- [x] The manifest is re-exported from the package root (`src/lib/index.ts`); add an `exports` entry if a separate import path is wanted (e.g. `dssoca/config`)
- [x] Token **values** stay in `src/styles/` SCSS — the manifest references theme/density names + defaults, not full token tables
- [x] `applyDesignConfig` / `designAttributes` / `getDesignConfig` behaviour unchanged; all four theme×density combinations still resolve identically
- [x] Vitest coverage for the manifest (defaults, that config derives from it); `pnpm test` green
- [x] `pnpm pack` clean (publint); `DESIGN.md` / `docs/themes.md` note the config file
- [x] Non-breaking → patch/minor bump; agile updated + `node agile/build.mjs`

## Notes
- Keep the manifest declarative and serialisable-ish (no side effects) so it can later back a JSON
  export or tooling if needed.
- The owner's intent: "a json or a ts file to configure how the ds works … in the future the
  design system will have more configurations." TS chosen for type-safety + zero parsing.
- This is the home that [[DS-0012-config-driven-size-system]] extends with `sizeVariant` (global
  default size) and a `ComponentsSize` map (per-component default sizes).
- Mirrors the "config is the source of truth" idea from `config.ts` today; see also `DESIGN.md`.
