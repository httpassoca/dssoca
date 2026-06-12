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
} from './dssoca.config.js'

// Re-exported so the `dssoca` / `./config` import paths expose the config vocab.
export { dssocaConfig }
export type { ColorTheme, Size, ComponentName, ComponentsSize }
export type { DssocaConfig, DesignAxis } from './dssoca.config.js'

export interface DesignConfig {
  theme: ColorTheme
  /** Global default size for every component — written as [data-size-variant]. */
  sizeVariant: Size
  /** Per-component default sizes; components not listed inherit `sizeVariant`. */
  componentsSize: ComponentsSize
}

/** Defaults derived from the manifest — change them in `dssoca.config.ts`. */
export const defaultDesignConfig: DesignConfig = {
  theme: dssocaConfig.theme.default,
  sizeVariant: dssocaConfig.size.default,
  componentsSize: {},
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
