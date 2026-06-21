/**
 * Design system runtime config.
 *
 * The available axes, their values, and the defaults are declared once in
 * `dssoca.config.ts`; this module derives its types + defaults from that
 * manifest and provides the runtime helpers (see DESIGN.md):
 *   • color — written as [data-theme]
 *   • size  — written as [data-size-variant]  (renamed from `density` in 0.4.0)
 *
 * Sizing has three layers (highest priority first):
 *   1. a component's `size` prop          (per instance)
 *   2. `componentsSize[Name]`             (per-component default)
 *   3. `sizeVariant` on an ancestor       (global default; `md` out of the box)
 */

import {
  dssocaConfig,
  type ColorTheme,
  type Size,
  type ComponentName,
  type ComponentsSize,
  type SpinnerVariant,
} from './dssoca.config.js'

// Re-exported so the `dssoca` / `./config` import paths expose the config vocab.
export { dssocaConfig }
export type { ColorTheme, Size, ComponentName, ComponentsSize, SpinnerVariant }
export type { DssocaConfig, DesignAxis } from './dssoca.config.js'

export interface DesignConfig {
  theme: ColorTheme
  /** Global default size for every component — written as [data-size-variant]. */
  sizeVariant: Size
  /** Per-component default sizes; components not listed inherit `sizeVariant`. */
  componentsSize: ComponentsSize
  /**
   * Global default Spinner glyph (DS-0108). Unlike `theme`/`sizeVariant` this is
   * NOT a CSS axis — it is never painted as a `data-*` attribute (see
   * `designAttributes`, which intentionally omits it). It threads to the Spinner
   * component through `resolveSpinnerVariant`; a per-usage `variant` prop wins.
   */
  spinnerVariant: SpinnerVariant
}

/** Defaults derived from the manifest — change them in `dssoca.config.ts`. */
export const defaultDesignConfig: DesignConfig = {
  theme: dssocaConfig.theme.default,
  sizeVariant: dssocaConfig.size.default,
  componentsSize: {},
  spinnerVariant: dssocaConfig.spinner.default,
}

let current: DesignConfig = {
  ...defaultDesignConfig,
  componentsSize: { ...defaultDesignConfig.componentsSize },
}

/** Current resolved config (last applied, or defaults). */
export function getDesignConfig(): DesignConfig {
  return { ...current, componentsSize: { ...current.componentsSize } }
}

/**
 * Build the `data-*` attribute map for a config — handy for SSR / markup so the
 * correct theme + size paint on the first frame with no flash.
 *
 *   <html {...designAttributes({ sizeVariant: 'sm' })}> … </html>
 *
 * Only the CSS axes (`theme`, `sizeVariant`) appear here. `spinnerVariant` is a
 * default-prop axis, not a CSS one, so it is deliberately omitted (DS-0108) — it
 * is consumed via `resolveSpinnerVariant`, never as a `data-*` attribute.
 */
export function designAttributes(config: Partial<DesignConfig> = {}): {
  'data-theme': ColorTheme
  'data-size-variant': Size
} {
  const merged = { ...defaultDesignConfig, ...config }
  return { 'data-theme': merged.theme, 'data-size-variant': merged.sizeVariant }
}

/**
 * Apply theme + size to a DOM element (defaults to <html>). Merges over the
 * current config so callers can flip one axis at a time (`componentsSize` is
 * merged key-by-key). SSR-safe: no-op when no document and no explicit target.
 */
export function applyDesignConfig(
  config: Partial<DesignConfig> = {},
  target?: HTMLElement,
): DesignConfig {
  current = {
    ...current,
    ...config,
    componentsSize: { ...current.componentsSize, ...(config.componentsSize ?? {}) },
  }
  const el = target ?? (typeof document !== 'undefined' ? document.documentElement : undefined)
  if (el) {
    el.setAttribute('data-theme', current.theme)
    el.setAttribute('data-size-variant', current.sizeVariant)
  }
  return getDesignConfig()
}

/**
 * Resolve the size a component should APPLY on its own root (as
 * `data-size-variant`), or `undefined` to inherit the global `sizeVariant`
 * through the cascade. Resolution order: explicit `size` prop →
 * `componentsSize[name]` → inherit.
 */
export function resolveComponentSize(name: ComponentName, size?: Size): Size | undefined {
  return size ?? current.componentsSize[name]
}

/**
 * Resolve the Spinner glyph a component should render: an explicit `variant`
 * wins, else the configured global `spinnerVariant` (DS-0108). Mirrors
 * `resolveComponentSize`, but ALWAYS returns a concrete variant (never
 * `undefined`) — there is no CSS cascade for the glyph, so the component needs a
 * definite value to pick frames.
 */
export function resolveSpinnerVariant(variant?: SpinnerVariant): SpinnerVariant {
  return variant ?? current.spinnerVariant
}
