---
id: DS-0108
type: story
title: "Config — global default Spinner variant (overridable per usage)"
status: done
priority: high
tags: [config, spinner, api]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca consumer, I want to set the Spinner *variant* once, globally, via the design config so
that every loading affordance in my app (standalone `Spinner`, Button loading state, future
inline busy states) uses a single house spinner without me repeating the `variant` prop — while
still being able to override it per usage when a specific spot needs a different one.

Today `Spinner.svelte` hardcodes `variant = 'boxBounce2'` as its prop default; there is no
system-level way to change the house spinner. This story adds a configurable default and a clean
resolution chain that mirrors the existing size system (manifest → derived config → resolver →
component fallback).

**Mechanism — mirror the existing `size` axis precisely:**
- **Manifest** (`src/lib/dssoca.config.ts`): add a `spinner` axis to `dssocaConfig` shaped like the
  other axes — `{ values, default }`. Its `values` must be the `SpinnerVariant` union (the keys of
  `SPINNER_VARIANTS`) and its `default` a sensible house spinner (`'boxBounce2'`, the current
  hardcoded default, so behaviour is unchanged out of the box). Because `SpinnerVariant` lives in
  `Spinner.svelte`, decide and document the type wiring: either (a) lift the variant-name list to
  `dssoca.config.ts` and have `Spinner.svelte` derive its union from the manifest, or (b) type the
  axis `values` as `readonly SpinnerVariant[]` by importing the union — keep the *single source of
  truth* principle (no duplicated literal lists that can drift). Prefer (a) so the manifest stays the
  config source of truth, matching how `size` is declared there.
- **DesignConfig** (`src/lib/config.ts`): add `spinnerVariant: SpinnerVariant` to the `DesignConfig`
  interface and seed `defaultDesignConfig.spinnerVariant` from `dssocaConfig.spinner.default`.
  `applyDesignConfig` already spreads `config` over `current`, so a partial `{ spinnerVariant }` flows
  through; confirm it merges like `theme`/`sizeVariant` (it is a scalar, not the `componentsSize`
  map). Unlike `theme`/`sizeVariant`, the spinner variant is **not** a `data-*` attribute on `<html>`
  (it is not a CSS axis), so `designAttributes` is unchanged — document that asymmetry.
- **Resolver** (`src/lib/config.ts`): add `resolveSpinnerVariant(variant?: SpinnerVariant)` mirroring
  `resolveComponentSize` — return `variant ?? current.spinnerVariant`. Unlike `resolveComponentSize`
  (which may return `undefined` to inherit via the cascade) this **always** returns a concrete variant,
  because there is no CSS cascade for the spinner glyph — the component needs a definite value to pick
  frames.
- **Component** (`src/lib/components/Spinner.svelte`): change the `variant` prop default from the
  hardcoded `'boxBounce2'` to `undefined`, and resolve via `resolveSpinnerVariant(variant)` so an
  unset `variant` falls back to the configured default while an explicit `variant` prop still wins.
- **Barrel** (`src/lib/index.ts` / `src/lib/config.ts` re-exports): export the new
  `resolveSpinnerVariant` helper and the `spinner`-axis-derived type so consumers and dependents can
  use them.

This **unblocks** [[DS-0113-button-loading-spinner-variant]] (Button's loading spinner reads the same
configured default instead of a bespoke CSS spinner / its own hardcoded choice).

## Acceptance criteria
- [x] `dssocaConfig` (in `src/lib/dssoca.config.ts`) gains a `spinner` axis `{ values, default }`
      whose `values` are the `SpinnerVariant` names and `default` is `'boxBounce2'`; the variant-name
      list has a single source of truth (no duplicated literal list that can drift from
      `SPINNER_VARIANTS`).
- [x] `DesignConfig` gains `spinnerVariant: SpinnerVariant` and `defaultDesignConfig.spinnerVariant`
      derives from `dssocaConfig.spinner.default`.
- [x] `applyDesignConfig({ spinnerVariant })` updates `current` and `getDesignConfig()` reflects it;
      `designAttributes` is unchanged (spinner is not a `data-*` CSS axis) and this asymmetry is noted
      in the config doc comment.
- [x] `resolveSpinnerVariant(variant?)` exists, returns the explicit `variant` when set else the
      configured `current.spinnerVariant` (always a concrete value, never `undefined`).
- [x] `Spinner.svelte` defaults `variant` to `undefined` and resolves through
      `resolveSpinnerVariant(variant)`; with no config change behaviour is identical to today
      (`'boxBounce2'`), a global `spinnerVariant` config flips every unset spinner, and a per-usage
      `variant` prop still overrides the global default.
- [x] New types/helpers (`resolveSpinnerVariant`, the spinner-axis type) are exported from the barrel
      (`src/lib/index.ts`) and `src/lib/config.ts` re-exports.
- [x] House rules respected: zero border-radius untouched, `--ss-*` / `.ss-*` naming preserved, scoped
      SCSS only, Svelte 5 runes; WCAG 2.2 AA preserved (the `role="status"` / label affordances on
      `Spinner` are unchanged).
- [x] Tests added/updated: `resolveSpinnerVariant` precedence (prop > config > manifest default),
      `applyDesignConfig`/`getDesignConfig` round-trip for `spinnerVariant`, and `Spinner` rendering the
      configured default when `variant` is unset. `pnpm test` green (vitest-axe on the Spinner render).
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed) — the Spinner page documents the new global `spinnerVariant` config and
      the prop > config > default precedence; the design-config docs list the new `spinner` axis.

## Notes
- Refinement research (cited):
  - **Vuetify global configuration** is the canonical "global default, per-instance override" model:
    a `defaults` object sets default prop values globally and per-component, and any value passed
    directly to a component instance overrides the configured default. Our chain
    (`resolveSpinnerVariant`: prop → global `spinnerVariant` → manifest `default`) is the same
    precedence, scoped to one prop. (vuetifyjs.com — Global configuration.)
  - **CMS Design System** rolled per-component global options into a single get/set settings function,
    with individual instances overriding via a prop/attribute — validating a single config surface
    (our `dssocaConfig` + `applyDesignConfig`) plus an instance escape hatch (the `variant` prop).
    (design.cms.gov — Global config.)
  - **NewsKit** and **MUI** both expose theme-level component defaults overridden per instance (MUI
    `theme.defaultProps`, e.g. a global `MuiButton` `size`); the pattern of "theme default prop +
    instance prop wins" is industry-standard. (newskit.co.uk — Component defaults; mui.com — Density /
    default props.)
  - **Svelte 5 module-state vs context**: `config.ts` already uses module-level mutable state
    (`current`) as the global config store rather than Svelte context — appropriate here because the
    config is a singleton app-wide default, not per-subtree, and is read from a plain `.ts` resolver
    (no component instance needed). Svelte guidance warns module-level mutable state can leak across
    requests on the server; this is acceptable for a *default config* that callers set explicitly via
    `applyDesignConfig` (same trade-off already accepted for `sizeVariant`). If per-subtree spinner
    overrides are ever wanted, that is a separate context-based story — out of scope here.
    (svelte.dev — Context; mainmatter.com — Global state do's and don'ts.)
  - Takeaway adopted: extend the *existing* manifest→config→resolver→fallback pipeline rather than
    inventing a parallel mechanism, so Spinner's default behaves exactly like `size` and dependents can
    reuse `resolveSpinnerVariant`.
- File refs: `src/lib/dssoca.config.ts` (add `spinner` axis + `DssocaConfig` field);
  `src/lib/config.ts` (`DesignConfig`, `defaultDesignConfig`, `applyDesignConfig`,
  `resolveSpinnerVariant`, re-exports); `src/lib/components/Spinner.svelte` (`variant` default +
  resolve); `src/lib/index.ts` (barrel); `documentation/src/lib/docs.config.ts` (Spinner page).
- Cross-links: unblocks [[DS-0113-button-loading-spinner-variant]]; sibling foundation stories
  [[DS-0110-icons-via-icon-component]] and [[DS-0111-coordinated-inner-sizes]] under epic DS-0107.
