/**
 * dssoca configuration manifest — the single source of truth for *how the
 * design system is configured*: which axes exist, the values each one allows,
 * and the system defaults. `config.ts` derives its types and defaults from
 * here, so adding a value (or a whole new axis) is a one-place change.
 *
 * Two axes today (see DESIGN.md):
 *   • theme — color, written as [data-theme]
 *   • size  — chrome scale (sm | md | lg), written as [data-size-variant]
 *
 * The `size` axis replaced the former `density` axis in 0.4.0 (DS-0012):
 * compact → `sm`, comfy → `md`, plus a new `lg`. The global default is set by
 * `sizeVariant`; per-component defaults by `componentsSize`; per instance by a
 * component's `size` prop.
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
  readonly size: DesignAxis
}

/**
 * The manifest. `as const` preserves the value/default literals so the unions
 * below can be derived from it; `satisfies` validates the shape without widening.
 */
export const dssocaConfig = {
  theme: { values: ['dark', 'light'], default: 'dark' },
  size: { values: ['sm', 'md', 'lg'], default: 'md' },
} as const satisfies DssocaConfig

/** Color axis values — derived from the manifest (`'dark' | 'light'`). */
export type ColorTheme = (typeof dssocaConfig)['theme']['values'][number]

/** Size axis values — derived from the manifest (`'sm' | 'md' | 'lg'`). */
export type Size = (typeof dssocaConfig)['size']['values'][number]

/** Names of the components that accept a `size` prop / `componentsSize` entry. */
export const COMPONENT_NAMES = [
  'Accordion',
  'Badge',
  'BottomNav',
  'Button',
  'Card',
  'Container',
  'EmptyState',
  'Heading',
  'Icon',
  'Image',
  'Input',
  'Link',
  'LogStream',
  'Menu',
  'MetricTile',
  'SegmentedControl',
  'ServiceCard',
  'Sidebar',
  'Sparkline',
  'Spinner',
  'Textarea',
  'Toaster',
  'Topbar',
] as const

export type ComponentName = (typeof COMPONENT_NAMES)[number]

/** Per-component default sizes; any omitted component inherits `sizeVariant`. */
export type ComponentsSize = Partial<Record<ComponentName, Size>>
