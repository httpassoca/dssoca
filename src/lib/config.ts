/**
 * Design system runtime config.
 *
 * Two independent axes drive the whole system (see DESIGN.md):
 *   • color   — `dark` | `light`   → written as [data-theme]
 *   • density — `comfy` | `compact` → written as [data-density]
 *
 * `comfy` is the general-purpose default; the hub opts into `compact`.
 */

export type ColorTheme = 'dark' | 'light'
export type Density = 'comfy' | 'compact'

export interface DesignConfig {
  theme: ColorTheme
  density: Density
}

export const defaultDesignConfig: DesignConfig = {
  theme: 'dark',
  density: 'comfy',
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
