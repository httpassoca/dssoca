import { describe, it, expect } from 'vitest'
import { deriveMonoPalette } from '../src/lib/theme-builder/derive'
import { fixContrastL, runChecks } from '../src/lib/theme-builder/checks'
import { PRESETS } from '../src/lib/theme-builder/presets'
import { contrastHex, hexToOklch, hueDistDeg } from '../../scripts/lib/palette.mjs'

const options = (accent: string) => ({ accent, tint: 0.35, neutralChroma: 1 })

describe('theme-builder checks — factory output passes by construction', () => {
  // Seed presets only: the by-construction guarantee is about the mono
  // DERIVATION. Terminal presets never derive — the builder loads their full
  // palettes as overrides, and the library's own suite (test/unit/presets.
  // test.ts) guards those values' contrast directly.
  it.each(PRESETS.filter((p) => !p.theme).map((p) => [p.name, p.accent]))(
    '%s (%s) yields zero failures',
    (_name, accent) => {
      const failures = runChecks(deriveMonoPalette(options(accent as string))).filter((c) => !c.ok)
      expect(failures).toEqual([])
    },
  )
})

describe('theme-builder checks — broken palettes are flagged and fixable', () => {
  it('flags fg on bg when fg equals bg, with a fixedHex that clears 7:1', () => {
    const palette = deriveMonoPalette(options(PRESETS[0].accent))
    palette.dark.fg = palette.dark.bg
    const check = runChecks(palette).find((c) => c.theme === 'dark' && c.id === 'fg-bg')
    expect(check).toBeDefined()
    expect(check!.ok).toBe(false)
    expect(check!.target).toBe(7)
    expect(check!.fixSlot).toBe('fg')
    expect(check!.fixedHex).toMatch(/^#[0-9a-f]{6}$/)
    expect(contrastHex(check!.fixedHex!, palette.dark.bg)).toBeGreaterThanOrEqual(7)
  })

  it('flags the red ↔ green hue distance without offering a slot fix', () => {
    const palette = deriveMonoPalette(options(PRESETS[0].accent))
    palette.dark.red = palette.dark.green
    const check = runChecks(palette).find((c) => c.theme === 'dark' && c.id === 'diff')
    expect(check).toBeDefined()
    expect(check!.ok).toBe(false)
    expect(check!.fixSlot).toBeUndefined()
    expect(check!.detail).toMatch(/tint/i)
  })
})

describe('theme-builder fixContrastL', () => {
  it('terminates and clears the target on a solvable pair', () => {
    const fixed = fixContrastL('#0a120a', '#1a241a', 4.5)
    expect(contrastHex(fixed, '#0a120a')).toBeGreaterThanOrEqual(4.5)
  })

  it('preserves hue within ~2° while walking lightness', () => {
    const before = hexToOklch('#7c1d1d') // a chromatic red, too dark for a dark bg
    const fixed = fixContrastL('#0a120a', '#7c1d1d', 4.5)
    const after = hexToOklch(fixed)
    expect(contrastHex(fixed, '#0a120a')).toBeGreaterThanOrEqual(4.5)
    expect(hueDistDeg(before.h, after.h)).toBeLessThanOrEqual(2)
  })

  it('walks toward the far side when fg and bg lightness coincide', () => {
    // Light bg, fg at the same lightness: the walk must head DOWN.
    const fixed = fixContrastL('#f2f7f2', '#f2f7f2', 4.5)
    expect(contrastHex(fixed, '#f2f7f2')).toBeGreaterThanOrEqual(4.5)
    expect(hexToOklch(fixed).l).toBeLessThan(hexToOklch('#f2f7f2').l)
  })
})
