---
id: DS-0012
type: story
title: "Config-driven size system (rename density → sizeVariant)"
status: done
priority: high
tags: [styling, api, breaking]
depends_on: [DS-0011]
parent: null
epic: null
created: 2026-06-07
updated: 2026-06-07
---

## Description
As a consumer, I want components to come in **sizes** (`sm | md | lg`) driven by a global config
with per-component and per-instance overrides, so I can scale the whole UI or individual
components consistently. This reframes the existing **density axis as a size system**: the current
`comfy`/`compact` density maps onto `md`/`sm`, a new `lg` step is added, and a global config sets
defaults that any component can override.

**Breaking → `0.4.0`**: the public density API (`data-density`, `applyDesignConfig({ density })`,
the `Density` type) is renamed to the size axis. Builds on [[DS-0011-design-system-config-file]].

## Acceptance criteria
- [x] Density axis renamed to a **size** axis: scale `sm | md | lg` (default `md`); remap the
      existing token blocks **`comfy` → `md`, `compact` → `sm`** in `src/styles/_tokens.scss` and
      add a new **`lg`** token set (larger control padding/font/etc.)
- [x] Attribute `data-density` → `data-size` (or `data-size-variant`); `applyDesignConfig` /
      `designAttributes` / `getDesignConfig` and the `Density` type updated to the size axis
- [x] `dssoca.config.ts` extended with **`sizeVariant`** (global default size for all components)
      and a **`ComponentsSize`** map (per-component default size overrides)
- [x] **Every component** gets a `size?: 'sm' | 'md' | 'lg'` prop, resolving
      `prop ?? ComponentsSize[component] ?? sizeVariant ?? 'md'`; non-global sizes applied via
      **local `--ss-*` overrides** on the instance so the scoped component CSS is unchanged
- [x] Icon & PassocaMark: numeric `size` prop **renamed to `px`** (frees `size` for the scale);
      update internal usages (`Sidebar` `<Icon px=…>`, `Topbar` `<PassocaMark px=…>`)
- [x] Storybook: density toolbar global → size; component stories expose the `size` control;
      stories + Vitest tests updated (including the renamed Icon/PassocaMark prop)
- [x] Zero border-radius + `ss-`-identity rules preserved; all theme × size combinations render correctly
- [x] `pnpm test` green; `pnpm pack` clean; `version` → **0.4.0** with a migration note
      (density API → size); `DESIGN.md` / `CLAUDE.md` / `docs/` updated; agile + board rebuilt

## Notes
- Owner's model: a global config controls all component sizes (default `md`); `ComponentsSize`
  sets per-component defaults; each component's `size` prop overrides per instance; **compact→sm,
  comfy→md, lg new**; config `sizeVariant` sets the global default. Density is renamed entirely
  into this system (chosen over keeping density as a separate parallel axis).
- Per-instance/per-component sizes use local CSS custom-property overrides (Svelte supports
  `--ss-control-py` overrides on a component), so the cascade keeps working and component `<style>`
  blocks stay untouched — consistent with how the axis tokens already work.
- Research: EightShapes "Size in Design Systems" (≤3 stops, md default), Radix Themes (`size` vs
  global `scaling`), Carbon/shadcn size scales.
- Decide the exact `lg` token values + the attribute name (`data-size` vs `data-size-variant`) at
  implementation; migration note must spell out the density→size rename for consumers.
- Depends on [[DS-0011-design-system-config-file]]; precedes the docs site
  [[DS-0010-custom-docs-site]] (which documents the final size API).
