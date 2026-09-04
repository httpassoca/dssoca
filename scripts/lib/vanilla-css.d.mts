/**
 * Hand-written declarations for vanilla-css.mjs (the module stays dependency-free plain JS so
 * Node can run it from `prepack`; tests and the docs app get real types from here).
 */

export type ComponentName =
  | 'Accordion'
  | 'Avatar'
  | 'Badge'
  | 'BottomNav'
  | 'BoxPlot'
  | 'BumpChart'
  | 'Button'
  | 'Card'
  | 'Chart'
  | 'Container'
  | 'DateField'
  | 'EmptyState'
  | 'FileDrop'
  | 'Heading'
  | 'Heatmap'
  | 'Icon'
  | 'Image'
  | 'Input'
  | 'Kbd'
  | 'Link'
  | 'LogStream'
  | 'Menu'
  | 'MetricTile'
  | 'Modal'
  | 'NumberField'
  | 'Pagination'
  | 'ScatterPlot'
  | 'SearchPalette'
  | 'SegmentedControl'
  | 'Select'
  | 'ServiceCard'
  | 'ShortcutsHelp'
  | 'Sidebar'
  | 'Sparkline'
  | 'Spinner'
  | 'Switch'
  | 'Table'
  | 'Textarea'
  | 'Toaster'
  | 'Tooltip'
  | 'Topbar'

export const ROOT_CLASSES: Readonly<Record<ComponentName, readonly string[]>>
export const ALL_ROOTS: readonly string[]
export function scopeLimit(roots: readonly string[]): string
export const BANNER: string

export interface Rule {
  prelude: string
  body: string
  kind: 'style' | 'keyframes' | 'media' | 'supports'
}

export interface ExtractedCss {
  keyframes: string[]
  scoped: string[]
  globals: string[]
}

export interface SpinnerFramesLike {
  interval: number
  frames: readonly string[]
}

export interface BuildOptions {
  spinnerVariants: Record<string, SpinnerFramesLike>
  defaultSpinnerVariant: string
}

export function extractStyleBlock(svelteSource: string): string | null
export function stripCommentsAndCharset(css: string): string
export function splitRules(css: string): Rule[]
export function deglobalize(prelude: string, roots: readonly string[]): string
export function scopeSelector(prelude: string, roots: readonly string[]): string
export function extractComponentCss(name: string, css: string): ExtractedCss
export function scopeBlock(roots: readonly string[], scopedRules: string[]): string
export function spinnerCss(
  variants: Record<string, SpinnerFramesLike>,
  defaultVariant: string,
): { keyframes: string[]; scoped: string[] }
export const TOASTER_EXTRA: { keyframes: string[]; scoped: string[] }
export function buildVanillaCss(components: Record<string, string>, opts: BuildOptions): string
