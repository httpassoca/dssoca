/**
 * dssoca configuration manifest — the single source of truth for *how the
 * design system is configured*: which axes exist, the values each one allows,
 * and the system defaults. `config.ts` derives its types and defaults from
 * here, so adding a value (or a whole new axis) is a one-place change.
 *
 * Today there are two axes (see DESIGN.md):
 *   • theme   — color,        written as [data-theme]
 *   • density — chrome scale, written as [data-density]
 *
 * Extend `dssocaConfig` (and the `DssocaConfig` shape) as the design system
 * gains more configuration.
 */

/** One configurable axis: its allowed values + the default applied when unset. */
export interface DesignAxis<Values extends readonly string[] = readonly string[]> {
  /** Allowed values for the axis (by convention the default appears here too). */
  readonly values: Values
  /** The value applied when a consumer sets nothing. */
  readonly default: Values[number]
}

/** Shape of the manifest — one entry per axis the design system understands. */
export interface DssocaConfig {
  readonly theme: DesignAxis
  readonly density: DesignAxis
}

/**
 * The manifest. `as const` preserves the value/default literals so the unions
 * below can be derived from it; `satisfies` validates the shape without widening.
 */
export const dssocaConfig = {
  theme:   { values: ['dark', 'light'],    default: 'dark' },
  density: { values: ['comfy', 'compact'], default: 'comfy' },
} as const satisfies DssocaConfig

/** Color axis values — derived from the manifest (`'dark' | 'light'`). */
export type ColorTheme = (typeof dssocaConfig)['theme']['values'][number]

/** Density axis values — derived from the manifest (`'comfy' | 'compact'`). */
export type Density = (typeof dssocaConfig)['density']['values'][number]
