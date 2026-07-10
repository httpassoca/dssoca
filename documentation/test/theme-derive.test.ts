import { describe, it, expect } from 'vitest'
import { deriveMonoPalette, resolvePalette } from '../src/lib/theme-builder/derive'
import { SLOTS } from '../src/lib/theme-builder/types'
import { PRESETS } from '../src/lib/theme-builder/presets'
import { hexToOklch, hueDistDeg, RED_GREEN_MIN_DEG } from '../../scripts/lib/palette.mjs'

const HEX = /^#[0-9a-f]{6}$/

// Every preset plus adversarial seeds: near-black (almost no chroma to work
// with) and a pale pastel (very high lightness, low chroma).
const seeds = [...PRESETS.map((p) => p.accent), '#111111', '#f5c2e7']

const options = (accent: string) => ({ accent, tint: 0.35, neutralChroma: 1 })

describe('theme-builder derive — structure', () => {
  it.each(seeds)('derives both themes with all 19 slots as valid #rrggbb (%s)', (seed) => {
    const palette = deriveMonoPalette(options(seed))
    for (const theme of ['dark', 'light'] as const) {
      expect(Object.keys(palette[theme]).sort()).toEqual([...SLOTS].sort())
      for (const slot of SLOTS) {
        expect(palette[theme][slot], `${theme}.${slot}`).toMatch(HEX)
      }
    }
  })

  it.each(seeds)('is deterministic (%s)', (seed) => {
    expect(deriveMonoPalette(options(seed))).toEqual(deriveMonoPalette(options(seed)))
  })

  it('keeps the seed verbatim as the dark accent', () => {
    for (const preset of PRESETS) {
      expect(deriveMonoPalette(options(preset.accent)).dark.accent).toBe(preset.accent)
    }
  })
})

describe('theme-builder derive — red ↔ green separation', () => {
  it.each(seeds)('holds ≥ 45° whenever the slots carry measurable chroma (%s)', (seed) => {
    const palette = deriveMonoPalette(options(seed))
    for (const theme of ['dark', 'light'] as const) {
      const red = hexToOklch(palette[theme].red)
      const green = hexToOklch(palette[theme].green)
      // Near-achromatic seeds (e.g. #111111) produce gray hue slots whose
      // measured hue is numerically meaningless — skip the angle there.
      if (red.c < 0.01 || green.c < 0.01) continue
      expect(hueDistDeg(red.h, green.h), `${seed} ${theme}`).toBeGreaterThanOrEqual(
        RED_GREEN_MIN_DEG - 1, // hex round-trip tolerance
      )
    }
  })
})

describe('theme-builder resolvePalette — overrides', () => {
  const opts = options(PRESETS[0].accent)

  it('applies per-slot overrides on top of the derived palette, per theme', () => {
    const base = deriveMonoPalette(opts)
    const resolved = resolvePalette(opts, { dark: { red: '#ff0000' }, light: { fg: '#123456' } })
    expect(resolved.dark.red).toBe('#ff0000')
    expect(resolved.light.fg).toBe('#123456')
    // Everything else untouched — including the same slot on the other theme.
    expect(resolved.light.red).toBe(base.light.red)
    expect(resolved.dark.fg).toBe(base.dark.fg)
  })

  it('removing the override restores the derived value', () => {
    const base = deriveMonoPalette(opts)
    const overridden = resolvePalette(opts, { dark: { bg: '#000000' } })
    expect(overridden.dark.bg).toBe('#000000')
    expect(resolvePalette(opts, {})).toEqual(base)
    expect(resolvePalette(opts, { dark: {} }).dark.bg).toBe(base.dark.bg)
  })
})
