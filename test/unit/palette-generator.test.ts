import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  derivePalette,
  emitTokensRegion,
  contrastHex,
  hexToOklch,
  oklchToHex,
  clampToSrgbGamut,
  hueDistDeg,
  mixHueDeg,
  mixOklab,
  slotToCssVar,
  SLOT_ORDER,
  GEN_BEGIN,
  GEN_END,
  DEFAULT_SEED,
  RED_GREEN_MIN_DEG,
  BRAND_PINS,
} from '../../scripts/lib/palette.mjs'

const AA = 4.5
const HEX = /^#[0-9a-f]{6}$/
/** Slots the system uses as TEXT — must hold AA on bg and bg-elev (DS-0013). */
const TEXT_SLOTS = [
  'fg',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
]

/** bg-elev exactly as the semantic layer derives it (see _tokens.scss Layer B). */
function bgElevOf(theme: Record<string, string>, mode: 'dark' | 'light'): string {
  return mode === 'dark'
    ? oklchToHex(mixOklab(hexToOklch(theme.bg), hexToOklch(theme.brightWhite), 0.88))
    : theme.brightWhite
}

describe('palette math — conversions & helpers', () => {
  it('hex → oklch → hex round-trips within 1/255 per channel', () => {
    for (const hex of ['#66ef73', '#0a120a', '#ff5c5c', '#123456', '#fafdfa', '#808080']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex)
    }
  })

  it('oklch endpoints behave (white L≈1, black L≈0, red hue ≈ 29°)', () => {
    expect(hexToOklch('#ffffff').l).toBeCloseTo(1, 2)
    expect(hexToOklch('#000000').l).toBeCloseTo(0, 2)
    expect(hexToOklch('#ff0000').h).toBeCloseTo(29.23, 0)
  })

  it('contrast is the WCAG ratio: black/white = 21, symmetric', () => {
    expect(contrastHex('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastHex('#66ef73', '#0a120a')).toBeCloseTo(contrastHex('#0a120a', '#66ef73'), 10)
  })

  it('hue helpers wrap the circle (350↔10 = 20°, shortest-arc mixing)', () => {
    expect(hueDistDeg(350, 10)).toBe(20)
    expect(mixHueDeg(350, 10, 0.5)).toBe(0)
  })

  it('gamut clamp returns displayable colors at extreme chroma', () => {
    const c = clampToSrgbGamut({ l: 0.5, c: 0.4, h: 145 })
    expect(oklchToHex(c)).toMatch(HEX)
    expect(c.c).toBeLessThan(0.4)
  })
})

describe('derivePalette — the mono recipe', () => {
  const palette = derivePalette({ accent: DEFAULT_SEED })

  it('dark accent is the seed byte-for-byte (zero brand change)', () => {
    expect(palette.dark.accent).toBe(DEFAULT_SEED)
  })

  it('produces all 19 slots as valid hex in both themes', () => {
    for (const mode of ['dark', 'light'] as const) {
      for (const slot of SLOT_ORDER) {
        expect(palette[mode][slot], `${mode}.${slot}`).toMatch(HEX)
      }
    }
  })

  it('is deterministic', () => {
    expect(derivePalette({ accent: DEFAULT_SEED })).toEqual(palette)
  })

  it('neutrals carry the seed hue (mono rule) and never hit pure black/white', () => {
    const seedHue = hexToOklch(DEFAULT_SEED).h
    for (const mode of ['dark', 'light'] as const) {
      for (const slot of ['black', 'brightBlack'] as const) {
        expect(
          hueDistDeg(hexToOklch(palette[mode][slot]).h, seedHue),
          `${mode}.${slot} hue`,
        ).toBeLessThan(15)
      }
      for (const slot of SLOT_ORDER) {
        expect(palette[mode][slot]).not.toBe('#000000')
        expect(palette[mode][slot]).not.toBe('#ffffff')
      }
    }
    // Light bg is hue-tinted; dark bg is a BRAND PIN, not a derivation.
    expect(hueDistDeg(hexToOklch(palette.light.bg).h, seedHue)).toBeLessThan(15)
  })

  it('applies the brand pins for the default seed (dark bg = the original near-black)', () => {
    expect(palette.dark.bg).toBe(BRAND_PINS.dark.bg)
    expect(palette.dark.bg).toBe('#100f10')
    // Pins are seed-scoped: a custom accent derives its bg fully by recipe.
    expect(derivePalette({ accent: '#7aa2f7' }).dark.bg).not.toBe('#100f10')
  })

  it('keeps red and yellow near their anchors (semantic hues stay legible)', () => {
    for (const mode of ['dark', 'light'] as const) {
      expect(hueDistDeg(hexToOklch(palette[mode].red).h, 25), `${mode} red`).toBeLessThan(15)
      expect(hueDistDeg(hexToOklch(palette[mode].yellow).h, 95), `${mode} yellow`).toBeLessThan(10)
    }
  })

  it(`keeps red and green ≥ ${RED_GREEN_MIN_DEG}° apart in both themes (diff legibility)`, () => {
    for (const mode of ['dark', 'light'] as const) {
      const d = hueDistDeg(hexToOklch(palette[mode].red).h, hexToOklch(palette[mode].green).h)
      expect(d, `${mode} red↔green`).toBeGreaterThanOrEqual(RED_GREEN_MIN_DEG)
    }
  })

  it('every text slot holds WCAG AA (≥4.5:1) on bg AND bg-elev in both themes', () => {
    for (const mode of ['dark', 'light'] as const) {
      const bgElev = bgElevOf(palette[mode], mode)
      for (const slot of TEXT_SLOTS) {
        const hex = palette[mode][slot]
        expect(contrastHex(hex, palette[mode].bg), `${mode}.${slot} on bg`).toBeGreaterThanOrEqual(
          AA,
        )
        expect(contrastHex(hex, bgElev), `${mode}.${slot} on bg-elev`).toBeGreaterThanOrEqual(AA)
      }
    }
  })

  it('light accent holds AA both as text on bg and under a bright-white label', () => {
    expect(contrastHex(palette.light.accent, palette.light.bg)).toBeGreaterThanOrEqual(AA)
    expect(contrastHex(palette.light.brightWhite, palette.light.accent)).toBeGreaterThanOrEqual(AA)
  })

  it('light yellow sits deeper than light red (yellow dies on light pages)', () => {
    expect(hexToOklch(palette.light.yellow).l).toBeLessThan(hexToOklch(palette.light.red).l)
  })

  it('holds the invariants for adversarial seeds too', () => {
    for (const seed of ['#ff5c5c', '#7aa2f7', '#f5c2e7', '#e0c36a', '#66d9ef']) {
      const p = derivePalette({ accent: seed })
      expect(p.dark.accent).toBe(seed)
      for (const mode of ['dark', 'light'] as const) {
        const d = hueDistDeg(hexToOklch(p[mode].red).h, hexToOklch(p[mode].green).h)
        expect(d, `${seed} ${mode} red↔green`).toBeGreaterThanOrEqual(RED_GREEN_MIN_DEG)
        const bgElev = bgElevOf(p[mode], mode)
        for (const slot of TEXT_SLOTS) {
          expect(
            contrastHex(p[mode][slot], p[mode].bg),
            `${seed} ${mode}.${slot}`,
          ).toBeGreaterThanOrEqual(AA)
          expect(
            contrastHex(p[mode][slot], bgElev),
            `${seed} ${mode}.${slot} elev`,
          ).toBeGreaterThanOrEqual(AA)
        }
      }
    }
  })
})

describe('generated region — drift guard', () => {
  it('_tokens.scss root-slot region byte-matches the committed recipe', () => {
    const file = resolve(process.cwd(), 'src/styles/_tokens.scss')
    const src = readFileSync(file, 'utf8')
    const begin = src.indexOf(GEN_BEGIN)
    const end = src.indexOf(GEN_END) + GEN_END.length
    expect(begin).toBeGreaterThan(-1)
    const committed = src.slice(begin, end)
    const expected = emitTokensRegion(derivePalette({ accent: DEFAULT_SEED }), {
      seed: DEFAULT_SEED,
    })
    expect(committed).toBe(expected)
  })

  it('slotToCssVar kebab-cases ("brightBlack" → "--ss-bright-black")', () => {
    expect(slotToCssVar('brightBlack')).toBe('--ss-bright-black')
    expect(slotToCssVar('bg')).toBe('--ss-bg')
    expect(slotToCssVar('accent')).toBe('--ss-accent')
  })
})
