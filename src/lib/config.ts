/**
 * Design system runtime config.
 *
 * The available axes, their values, and the defaults are declared once in
 * `dssoca.config.ts`; this module derives its types + defaults from that
 * manifest and provides the runtime helpers (see DESIGN.md):
 *   • color   — written as [data-theme]
 *   • density — written as [data-density]
 *
 * `comfy` is the general-purpose default; the hub opts into `compact`.
 */

import { dssocaConfig, type ColorTheme, type Density } from './dssoca.config.js'

// Re-exported so the long-standing `dssoca` / `./config` import paths keep working.
export { dssocaConfig }
export type { ColorTheme, Density }
export type { DssocaConfig, DesignAxis } from './dssoca.config.js'

export interface DesignConfig {
  theme: ColorTheme
  density: Density
}

/** Defaults derived from the manifest — change them in `dssoca.config.ts`. */
export const defaultDesignConfig: DesignConfig = {
  theme: dssocaConfig.theme.default,
  density: dssocaConfig.density.default,
}

let current: DesignConfig = { ...defaultDesignConfig }

/** Current resolved config (last applied, or defaults). */
export function getDesignConfig(): DesignConfig {
  return { ...current }
}

/**
 * Build the `data-*` attribute map for a config — handy for SSR / markup
 * so the correct density paints on first frame with no flash.
 *
 *   <div {...designAttributes({ density: 'compact' })}> … </div>
 */
export function designAttributes(
  config: Partial<DesignConfig> = {},
): { 'data-theme': ColorTheme; 'data-density': Density } {
  const merged = { ...defaultDesignConfig, ...config }
  return { 'data-theme': merged.theme, 'data-density': merged.density }
}

/**
 * Apply theme + density to a DOM element (defaults to <html>).
 * Merges over the current config so callers can flip one axis at a time.
 * SSR-safe: no-op when no document and no explicit target.
 */
export function applyDesignConfig(
  config: Partial<DesignConfig> = {},
  target?: HTMLElement,
): DesignConfig {
  current = { ...current, ...config }
  const el =
    target ?? (typeof document !== 'undefined' ? document.documentElement : undefined)
  if (el) {
    el.setAttribute('data-theme', current.theme)
    el.setAttribute('data-density', current.density)
  }
  return getDesignConfig()
}
