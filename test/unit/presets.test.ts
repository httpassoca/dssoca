/**
 * Preset terminal palettes (DS-0142).
 *
 * Pins the preset data invariants (slot completeness, valid hex, accent
 * coherence), the `presetPalette` resolver (single-mode mirroring, unknown
 * slugs), integration with `applyDesignConfig`, and — most importantly — the
 * WCAG 2.2 AA contrast guard: the same checks the docs theme-builder
 * corrector runs, re-asserted here so an upstream-value edit can't silently
 * ship an unreadable preset.
 */

import { describe, expect, it } from 'vitest'
import {
  applyDesignConfig,
  defaultDesignConfig,
  paletteSlotVar,
  paletteToCss,
  PALETTE_SLOTS,
  PRESET_THEMES,
  presetPalette,
  type ThemePalette,
} from '../../src/lib/index.js'
import {
  contrastHex,
  hexToOklch,
  hueDistDeg,
  RED_GREEN_MIN_DEG,
} from '../../scripts/lib/palette.mjs'

const HEX = /^#[0-9a-f]{6}$/
const HUE_SLOTS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'] as const

/** [preset label, mode, slots] for every mode a preset actually defines. */
const sides: Array<[string, 'dark' | 'light', ThemePalette]> = PRESET_THEMES.flatMap((p) =>
  (['dark', 'light'] as const).flatMap((mode) =>
    p[mode]
      ? [[`${p.name} ${mode}`, mode, p[mode]] as [string, 'dark' | 'light', ThemePalette]]
      : [],
  ),
)

describe('presets — data invariants', () => {
  it('ships the six expected presets', () => {
    expect(PRESET_THEMES.map((p) => p.name)).toEqual([
      'dracula',
      'tokyo-night',
      'gruvbox',
      'nord',
      'solarized',
      'coffee',
    ])
  })

  it('every preset has at least one mode and a label', () => {
    for (const p of PRESET_THEMES) {
      expect(p.label.length, p.name).toBeGreaterThan(0)
      expect(p.dark ?? p.light, p.name).toBeDefined()
    }
  })

  it.each(sides)('%s defines all 19 slots as #rrggbb', (_label, _mode, slots) => {
    for (const slot of PALETTE_SLOTS) expect(slots[slot], slot).toMatch(HEX)
  })

  it('the swatch accent matches the palette accent of the preferred (dark-first) mode', () => {
    for (const p of PRESET_THEMES) expect((p.dark ?? p.light)!.accent, p.name).toBe(p.accent)
  })
})

describe('presets — WCAG guard (mirrors the theme-builder corrector checks)', () => {
  it.each(sides)('%s clears every contrast target', (_label, mode, t) => {
    // Body text and muted text on the page background.
    expect(contrastHex(t.fg, t.bg), 'fg on bg').toBeGreaterThanOrEqual(7)
    expect(contrastHex(t.brightBlack, t.bg), 'brightBlack on bg').toBeGreaterThanOrEqual(4.5)
    // fg-shine role: brightWhite in dark mode, black in light mode.
    const shine = mode === 'dark' ? t.brightWhite : t.black
    expect(contrastHex(shine, t.bg), 'fg-shine on bg').toBeGreaterThanOrEqual(7)
    // Accent + the six ANSI hues as UI/graphic colors.
    expect(contrastHex(t.accent, t.bg), 'accent on bg').toBeGreaterThanOrEqual(3)
    for (const slot of HUE_SLOTS)
      expect(contrastHex(t[slot], t.bg), `${slot} on bg`).toBeGreaterThanOrEqual(3)
    // A filled accent must carry a readable label (bg or brightWhite).
    const label = Math.max(contrastHex(t.bg, t.accent), contrastHex(t.brightWhite, t.accent))
    expect(label, 'label on accent').toBeGreaterThanOrEqual(4.5)
  })

  it.each(sides)('%s keeps red and green hue-separated (diff-ability)', (_l, _m, t) => {
    const dist = hueDistDeg(hexToOklch(t.red).h, hexToOklch(t.green).h)
    expect(dist).toBeGreaterThanOrEqual(RED_GREEN_MIN_DEG)
  })
})

describe('presetPalette', () => {
  it('resolves a slug to a full two-mode Palette (deep copy)', () => {
    const palette = presetPalette('dracula')
    expect(palette.dark).toEqual(PRESET_THEMES[0].dark)
    expect(palette.light).toEqual(PRESET_THEMES[0].light)
    palette.dark.accent = '#123456'
    expect(PRESET_THEMES[0].dark!.accent).not.toBe('#123456')
  })

  it('accepts the PresetTheme object itself', () => {
    const nord = PRESET_THEMES.find((p) => p.name === 'nord')!
    expect(presetPalette(nord).dark).toEqual(nord.dark)
  })

  it('mirrors single-mode presets into both themes', () => {
    const nord = presetPalette('nord') // dark-only upstream
    expect(nord.light).toEqual(nord.dark)
    const coffee = presetPalette('coffee') // light-only (site theme)
    expect(coffee.dark).toEqual(coffee.light)
  })

  it('throws on an unknown slug', () => {
    expect(() => presetPalette('monokai' as never)).toThrow(/unknown preset theme 'monokai'/)
  })
})

describe('presets — integration with the config runtime', () => {
  it('round-trips through applyDesignConfig (active-theme slots painted inline)', () => {
    const palette = presetPalette('gruvbox')
    applyDesignConfig({ theme: 'dark', palette }, document.documentElement)
    for (const slot of PALETTE_SLOTS) {
      expect(document.documentElement.style.getPropertyValue(paletteSlotVar(slot))).toBe(
        palette.dark[slot],
      )
    }
    // Reset shared config state for other suites.
    applyDesignConfig(
      { ...defaultDesignConfig, componentsSize: {}, palette: null },
      document.documentElement,
    )
  })

  it('paletteToCss emits both blocks for a mirrored single-mode preset', () => {
    const css = paletteToCss(presetPalette('coffee'))
    expect(css).toContain(":root,\n[data-theme='dark'] {")
    expect(css).toContain("[data-theme='light'] {")
    expect(css).toContain('--ss-bg: #f9dec9;')
  })
})
