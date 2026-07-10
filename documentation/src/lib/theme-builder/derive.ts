/**
 * Theme Builder — palette derivation.
 *
 * Thin, typed wrapper over `derivePalette` from `scripts/lib/palette.mjs` (the
 * exact math that generates the shipped `_tokens.scss` slots — builder output
 * and library defaults can never drift), plus the override-merging resolver
 * the UI edits go through.
 */

import { derivePalette } from '../../../../scripts/lib/palette.mjs'
import type { BuilderOptions, Palette, SlotOverrides, ThemePalette } from './types'

/** Derive both 19-slot themes from the accent seed with the mono rules. */
export function deriveMonoPalette(options: BuilderOptions): Palette {
  const derived = derivePalette({
    accent: options.accent,
    tint: options.tint,
    neutralChroma: options.neutralChroma,
  })
  return { dark: derived.dark as ThemePalette, light: derived.light as ThemePalette }
}

/** The derived palette with per-slot manual overrides applied on top. */
export function resolvePalette(options: BuilderOptions, overrides: SlotOverrides): Palette {
  const base = deriveMonoPalette(options)
  return {
    dark: { ...base.dark, ...(overrides.dark ?? {}) },
    light: { ...base.light, ...(overrides.light ?? {}) },
  }
}
